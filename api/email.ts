import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../server/db";
import { emailSignups, insertEmailSignupSchema } from "../shared/schema";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "../server/emailService";
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
    if (action === 'signup') {
      return await handleEmailSignup(req, res);
    } else if (action === 'unsubscribe') {
      return await handleUnsubscribe(req, res);
    } else {
      return res.status(400).json({ error: 'Invalid action. Use ?action=signup or ?action=unsubscribe' });
    }
  } catch (error) {
    logError("Email error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function handleEmailSignup(req: VercelRequest, res: VercelResponse) {
  // Rate limiting for email signup (5 requests per hour)
  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const identifier = `email_signup_${clientIp}`;
  
  if (!checkRateLimit(identifier, 5, 60 * 60 * 1000)) {
    return res.status(429).json({ 
      error: "Too many signup attempts. Please try again later." 
    });
  }

  try {
    const body = await parseJsonBody(req);
    const emailData = insertEmailSignupSchema.parse(body);
    
    // Check if email already exists
    const [existingSignup] = await db
      .select()
      .from(emailSignups)
      .where(eq(emailSignups.email, emailData.email));
    
    if (existingSignup) {
      if (existingSignup.active) {
        return res.status(409).json({ error: "Email already subscribed" });
      } else {
        // Reactivate subscription
        await db
          .update(emailSignups)
          .set({ active: true, subscribedAt: new Date() })
          .where(eq(emailSignups.id, existingSignup.id));
        
        return res.json({ success: true, message: "Subscription reactivated!" });
      }
    }
    
    // Create new signup
    const [signup] = await db.insert(emailSignups).values(emailData).returning();
    
    // Send welcome email (non-blocking)
    try {
      const unsubscribeUrl = `${req.headers.origin || 'https://localhost:5000'}/api/email?action=unsubscribe&token=${Buffer.from(signup.email).toString('base64')}`;
      await sendWelcomeEmail(emailData.email, unsubscribeUrl);
    } catch (emailError) {
      logError("Failed to send welcome email", emailError);
      // Don't fail the signup if email fails
    }
    
    res.json({ success: true, message: "Successfully subscribed to email updates!" });

  } catch (error) {
    logError("Email signup error", error);
    if (error instanceof Error && error.message.includes('parse')) {
      res.status(400).json({ error: "Invalid email data" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

async function handleUnsubscribe(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return res.status(400).json({ error: "Unsubscribe token required" });
    }
    
    let email: string;
    try {
      email = Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      return res.status(400).json({ error: "Invalid unsubscribe token" });
    }
    
    const [signup] = await db
      .select()
      .from(emailSignups)
      .where(eq(emailSignups.email, email));
    
    if (!signup) {
      return res.status(404).json({ error: "Email subscription not found" });
    }
    
    if (!signup.active) {
      return res.json({ success: true, message: "Already unsubscribed" });
    }
    
    // Deactivate subscription
    await db
      .update(emailSignups)
      .set({ active: false })
      .where(eq(emailSignups.id, signup.id));
    
    res.json({ success: true, message: "Successfully unsubscribed" });

  } catch (error) {
    logError("Unsubscribe error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}