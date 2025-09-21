import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../server/db";
import { users, insertUserSchema } from "../../shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { sanitizeUserInput, validatePasswordStrength } from "../../server/securityMiddleware";
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
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    
    const [user] = await db.insert(users).values(userData).returning();
    
    // Cache the new user for faster future lookups
    cacheUser(user.id, user);
    
    res.json({ user: { ...user, password: undefined } });
    
  } catch (error) {
    logError("Registration error", error);
    if (error instanceof Error && error.message.includes('parse')) {
      res.status(400).json({ error: "Invalid user data" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}