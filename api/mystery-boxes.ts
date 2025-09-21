import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../server/db";
import { mysteryBoxes } from "../shared/schema";
import { setCorsHeaders, logError } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res, 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const boxes = await db.select().from(mysteryBoxes);
    res.json({ mysteryBoxes: boxes });
  } catch (error) {
    logError("Mystery boxes error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}