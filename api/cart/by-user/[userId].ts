import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../../../server/db";
import { cartItems, mysteryBoxes } from "../../../../shared/schema";
import { eq } from "drizzle-orm";
import { setCorsHeaders, logError } from "../../../_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res, 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;
  const userIdNum = parseInt(userId as string);
  
  if (isNaN(userIdNum)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const cartData = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        mysteryBox: {
          id: mysteryBoxes.id,
          name: mysteryBoxes.name,
          description: mysteryBoxes.description,
          price: mysteryBoxes.price,
          tier: mysteryBoxes.tier,
          image: mysteryBoxes.image,
        }
      })
      .from(cartItems)
      .leftJoin(mysteryBoxes, eq(cartItems.mysteryBoxId, mysteryBoxes.id))
      .where(eq(cartItems.userId, userIdNum));
    
    res.json({ cartItems: cartData });

  } catch (error) {
    logError("Get cart error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}