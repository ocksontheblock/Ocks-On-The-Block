// Security middleware for production-ready authentication
// Provides additional layers of protection and monitoring

import { Request, Response, NextFunction } from "express";

// Security headers middleware
export function addSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Only allow secure requests in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Prevent information leakage
  res.removeHeader('X-Powered-By');
  
  next();
}

// Input sanitization for user data
export function sanitizeUserInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 500); // Limit length
}

// Password strength validation
export function validatePasswordStrength(password: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (password.length < 8) {
    issues.push("Password must be at least 8 characters");
  }
  
  if (!/[A-Z]/.test(password)) {
    issues.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    issues.push("Password must contain at least one lowercase letter");
  }
  
  if (!/\d/.test(password)) {
    issues.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push("Password must contain at least one special character");
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// Enhanced error logging for debugging and monitoring
export function logSecurityEvent(event: string, details: any, req: Request) {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    path: req.path,
    method: req.method
  };
  
  console.log('[SECURITY]', JSON.stringify(logData));
}

// Middleware to detect suspicious activity
export function detectSuspiciousActivity(req: Request, res: Response, next: NextFunction) {
  // Only check API requests, not static assets or legitimate pages
  if (!req.path.startsWith('/api/')) {
    return next();
  }
  
  const suspiciousPatterns = [
    /\.\.\//,  // Path traversal
    /<script/i, // XSS attempts in request body
    /union.*select/i, // SQL injection in request body
  ];
  
  // Only check request body and query params for API requests
  const requestData = JSON.stringify({
    body: req.body,
    query: req.query
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logSecurityEvent('suspicious_request', {
        pattern: pattern.toString(),
        url: req.url,
        body: req.body
      }, req);
      
      return res.status(400).json({ error: "Invalid request" });
    }
  }
  
  next();
}

// Enhanced session validation
export function validateSession(req: Request, res: Response, next: NextFunction) {
  // Check for session hijacking indicators
  const userAgent = req.headers['user-agent'];
  const clientIp = req.ip || req.connection.remoteAddress;
  
  if (req.session?.userAgent && req.session.userAgent !== userAgent) {
    logSecurityEvent('session_hijack_attempt', {
      sessionUserAgent: req.session.userAgent,
      requestUserAgent: userAgent
    }, req);
    
    req.session.destroy((err: any) => {
      if (err) {
        console.error({
          level: "error",
          message: "Session destroy error",
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return res.status(401).json({ error: "Session invalid" });
  }
  
  // Store user agent for future validation
  if (req.session && !req.session.userAgent) {
    req.session.userAgent = userAgent;
    req.session.clientIp = clientIp;
  }
  
  next();
}