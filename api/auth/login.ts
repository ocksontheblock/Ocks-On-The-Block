import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../server/db";
import { users, loginUserSchema } from "../../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { cacheUser } from "../../server/sessionOptimizations";

// Utility function for safe error logging
function logError(message: string, error: unknown) {
  console.error({
    level: "error",
    message,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
}

// Simple rate limiting for serverless
const rateLimitStore = new Map();

function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }
  
  const requests = rateLimitStore.get(identifier);
  const validRequests = requests.filter((time: number) => time > windowStart);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - fix credentials issue
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting for login (10 requests per 15 minutes)
    const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const identifier = `login_${clientIp}`;
    
    if (!checkRateLimit(identifier, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ 
        error: "Too many login attempts. Please try again later." 
      });
    }

    const loginData = loginUserSchema.parse(req.body);
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, loginData.email));
    
    if (!user || !await bcrypt.compare(loginData.password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Cache the authenticated user
    cacheUser(user.id, user);
    
    res.json({ user: { ...user, password: undefined } });
    
  } catch (error) {
    logError("Login error", error);
    if (error instanceof Error && error.message.includes('parse')) {
      res.status(400).json({ error: "Invalid login data" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}