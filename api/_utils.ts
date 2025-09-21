import type { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to read and parse JSON body from Vercel request
export async function parseJsonBody(req: VercelRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf-8');
        if (!body.trim()) {
          resolve({});
          return;
        }
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

// Helper for CORS headers
export function setCorsHeaders(req: VercelRequest, res: VercelResponse, methods: string = 'GET,POST,PUT,DELETE,OPTIONS') {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Simple rate limiting for serverless
const rateLimitStore = new Map();

export function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
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

// Utility function for safe error logging
export function logError(message: string, error: unknown) {
  console.error({
    level: "error",
    message,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
}