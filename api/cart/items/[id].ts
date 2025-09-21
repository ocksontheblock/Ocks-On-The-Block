import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../../../server/db";
import { cartItems } from "../../../../shared/schema";
import { eq } from "drizzle-orm";
import { setCorsHeaders, logError, parseJsonBody } from "../../../_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res, 'PUT,DELETE,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  const cartId = parseInt(id as string);
  
  if (isNaN(cartId)) {
    return res.status(400).json({ error: "Invalid cart item ID" });
  }

  try {
    if (req.method === 'PUT') {
      // Update cart item quantity
      const body = await parseJsonBody(req);
      const { quantity } = body;
      
      if (typeof quantity !== 'number' || quantity <= 0 || quantity > 99) {
        return res.status(400).json({ error: "Invalid quantity" });
      }
      
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, cartId))
        .returning();
      
      res.json({ cartItem: updatedItem });
      
    } else if (req.method === 'DELETE') {
      // Delete cart item
      await db.delete(cartItems).where(eq(cartItems.id, cartId));
      res.json({ success: true });
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    logError("Cart item error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}