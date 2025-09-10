// Session and authentication optimizations for scalability
// Helps reduce database load and improve performance at scale

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// Extend Express Request type to include session
declare module 'express-serve-static-core' {
  interface Request {
    session?: any;
  }
}

// Cache for frequently accessed user data
const userCache = new Map<number, { user: any; expires: number }>();

export function cacheUser(userId: number, user: any, ttlMs: number = 5 * 60 * 1000) {
  userCache.set(userId, {
    user: { ...user, password: undefined }, // Never cache passwords
    expires: Date.now() + ttlMs
  });
}

export function getCachedUser(userId: number): any | null {
  const cached = userCache.get(userId);
  if (!cached || Date.now() > cached.expires) {
    userCache.delete(userId);
    return null;
  }
  return cached.user;
}

export function clearUserCache(userId: number) {
  userCache.delete(userId);
}

// Middleware to optimize session handling
export function optimizeSession(req: Request, res: Response, next: NextFunction) {
  // Add session compression for large session data
  if (req.session && Object.keys(req.session).length > 10) {
    // Log large sessions for monitoring
    console.warn(`Large session detected for user: ${req.session.userId || 'unknown'}`);
  }
  
  // Set optimized cache headers for static content
  if (req.path.startsWith('/api/static/') || req.path.startsWith('/public-objects/')) {
    res.set({
      'Cache-Control': 'public, max-age=3600, s-maxage=7200', // 1 hour browser, 2 hours CDN
    });
    
    // Override res.send to generate ETag based on response body
    const originalSend = res.send;
    res.send = function(body: any) {
      const etag = crypto.createHash("sha1").update(body).digest("hex");
      res.setHeader("ETag", etag);
      return originalSend.call(this, body);
    };
  }
  
  next();
}

// Batch processing for email operations to reduce load
export class BatchEmailProcessor {
  private emailQueue: Array<{ email: string; type: string; data?: any }> = [];
  private processTimeout: NodeJS.Timeout | null = null;
  private readonly batchSize = 50;
  private readonly batchTimeoutMs = 5000; // Process batch every 5 seconds

  addToQueue(email: string, type: string, data?: any) {
    this.emailQueue.push({ email, type, data });
    
    if (this.emailQueue.length >= this.batchSize) {
      this.processBatch();
    } else if (!this.processTimeout) {
      this.processTimeout = setTimeout(() => this.processBatch(), this.batchTimeoutMs);
    }
  }

  private async processBatch() {
    if (this.emailQueue.length === 0) return;
    
    const batch = this.emailQueue.splice(0, this.batchSize);
    
    try {
      // Group by email type for more efficient processing
      const groupedEmails = batch.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
      }, {} as Record<string, typeof batch>);
      
      console.log(`Processing batch of ${batch.length} emails in ${Object.keys(groupedEmails).length} groups`);
      
      // Process each type of email
      for (const [type, emails] of Object.entries(groupedEmails)) {
        // In a real implementation, you'd have specific handlers for each email type
        console.log(`Processing ${emails.length} emails of type: ${type}`);
      }
    } catch (error) {
      console.error({
        level: "error",
        message: "Batch email processing error",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      // Re-queue failed emails
      this.emailQueue.unshift(...batch);
    }
    
    this.processTimeout = null;
    
    // Continue processing if there are more emails
    if (this.emailQueue.length > 0) {
      this.processTimeout = setTimeout(() => this.processBatch(), this.batchTimeoutMs);
    }
  }
}

export const batchEmailProcessor = new BatchEmailProcessor();

// Database connection monitoring for scaling
export function monitorDatabasePerformance() {
  // Skip monitoring in serverless environments like Vercel
  if (process.env.VERCEL) {
    return;
  }
  
  setInterval(() => {
    // Log memory usage
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      console.warn(`High memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
    }
    
    // Monitor user cache size
    if (userCache.size > 1000) {
      console.warn(`Large user cache: ${userCache.size} entries`);
    }
  }, 60000); // Check every minute
}

// Cleanup expired users from cache to prevent memory leaks
function cleanupUserCache() {
  const entries = Array.from(userCache.entries());
  for (const [userId, cached] of entries) {
    if (cached.expires < Date.now()) {
      userCache.delete(userId);
    }
  }
}

// Run cleanup every 5 minutes (skip in serverless environments)
if (!process.env.VERCEL) {
  setInterval(cleanupUserCache, 5 * 60 * 1000);
}