import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: "ok",
    message: "Serverless functions are running!",
    timestamp: new Date().toISOString()
  });
}