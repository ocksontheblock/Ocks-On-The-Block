// Rate limiting middleware for scalability
// Protects against abuse and ensures fair resource usage

const requestCounts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
}

export function createRateLimit(options: RateLimitOptions) {
  return (req: any, res: any, next: any) => {
    const clientIp = req.ip || req.connection.remoteAddress || "unknown";
    const key = `${clientIp}:${req.route?.path || req.path}`;
    const now = Date.now();
    
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to cleanup
      const keysToDelete: string[] = [];
      for (const [k, v] of Array.from(requestCounts.entries())) {
        if (now > v.resetTime) {
          keysToDelete.push(k);
        }
      }
      keysToDelete.forEach(k => requestCounts.delete(k));
    }
    
    const record = requestCounts.get(key);
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      requestCounts.set(key, {
        count: 1,
        resetTime: now + options.windowMs
      });
      return next();
    }
    
    if (record.count >= options.maxRequests) {
      return res.status(429).json({
        error: options.message || "Too many requests. Please try again later.",
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    next();
  };
}

// Predefined rate limiters for common endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 login attempts per 15 minutes
  message: "Too many login attempts. Please try again in 15 minutes."
});

export const signupRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour  
  maxRequests: 5, // 5 signups per hour
  message: "Too many signup attempts. Please try again later."
});

export const emailSignupRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 3, // 3 email signups per 10 minutes
  message: "Too many email signup attempts. Please try again later."
});

export const apiRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 100, // 100 API calls per 5 minutes
  message: "API rate limit exceeded. Please slow down."
});