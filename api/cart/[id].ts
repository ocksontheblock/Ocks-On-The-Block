import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../server/db";
import { cartItems } from "../../shared/schema";
import { eq } from "drizzle-orm";

// Utility function for safe error logging
function logError(message: string, error: unknown) {
  console.error({
    level: "error",
    message,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers - fix credentials issue
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
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
      const { quantity } = req.body;
      
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