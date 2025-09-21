import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../server/db";
import { users, loginUserSchema } from "../../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { cacheUser } from "../../server/sessionOptimizations";
import { setCorsHeaders, logError, checkRateLimit, parseJsonBody } from "../_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res, 'POST,OPTIONS');
  
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

    const body = await parseJsonBody(req);
    const loginData = loginUserSchema.parse(body);
    
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