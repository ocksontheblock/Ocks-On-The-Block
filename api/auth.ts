import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../server/db";
import { users, insertUserSchema, loginUserSchema } from "../shared/schema";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import { sanitizeUserInput, validatePasswordStrength } from "../server/securityMiddleware";
import { cacheUser } from "../server/sessionOptimizations";
import { setCorsHeaders, logError, checkRateLimit, parseJsonBody } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res, 'POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const action = url.searchParams.get('action');

  try {
    if (action === 'login') {
      return await handleLogin(req, res);
    } else if (action === 'register') {
      return await handleRegister(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid action. Use ?action=login or ?action=register' });
    }
  } catch (error) {
    logError("Auth error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
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
  
  if (!user || !await bcryptjs.compare(loginData.password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  // Cache the authenticated user
  cacheUser(user.id, user);
  
  res.json({ user: { ...user, password: undefined } });
}

async function handleRegister(req: VercelRequest, res: VercelResponse) {
  // Rate limiting for registration (5 requests per 15 minutes)
  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const identifier = `signup_${clientIp}`;
  
  if (!checkRateLimit(identifier, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ 
      error: "Too many registration attempts. Please try again later." 
    });
  }

  const body = await parseJsonBody(req);
  const userData = insertUserSchema.parse(body);
  
  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, userData.email));
  
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }
  
  // Validate password strength
  const passwordValidation = validatePasswordStrength(userData.password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      error: "Password does not meet security requirements",
      details: passwordValidation.issues
    });
  }
  
  // Sanitize user input
  userData.username = sanitizeUserInput(userData.username);
  userData.email = sanitizeUserInput(userData.email);
  if (userData.firstName) userData.firstName = sanitizeUserInput(userData.firstName);
  if (userData.lastName) userData.lastName = sanitizeUserInput(userData.lastName);
  
  // Hash password
  const hashedPassword = await bcryptjs.hash(userData.password, 10);
  userData.password = hashedPassword;
  
  const [user] = await db.insert(users).values(userData).returning();
  
  // Cache the new user for faster future lookups
  cacheUser(user.id, user);
  
  res.json({ user: { ...user, password: undefined } });
}