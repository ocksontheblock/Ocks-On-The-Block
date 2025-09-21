import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../../server/db";
import { cartItems, mysteryBoxes, insertCartItemSchema } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { setCorsHeaders, logError, parseJsonBody } from "../_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res, 'POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Add item to cart
    const body = await parseJsonBody(req);
    const cartData = insertCartItemSchema.parse(body);
    
    // Validate quantity
    const quantity = cartData.quantity || 1;
    if (typeof quantity !== 'number' || quantity <= 0 || quantity > 99) {
      return res.status(400).json({ error: "Invalid quantity" });
    }
    
    // Check if item already in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, cartData.userId!),
        eq(cartItems.mysteryBoxId, cartData.mysteryBoxId!)
      ));
    
    if (existingItem) {
      // Update quantity
      const newQuantity = (existingItem.quantity || 0) + quantity;
      if (newQuantity > 99) {
        return res.status(400).json({ error: "Invalid quantity" });
      }
      
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      
      return res.json({ cartItem: updatedItem });
    }
    
    const [cartItem] = await db.insert(cartItems).values(cartData).returning();
    res.json({ cartItem });

  } catch (error) {
    logError("Cart error", error);
    if (error instanceof Error && error.message.includes('parse')) {
      res.status(400).json({ error: "Invalid request data" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}