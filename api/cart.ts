import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from "../server/db";
import { cartItems, mysteryBoxes, insertCartItemSchema } from "../shared/schema";
import { eq, and } from "drizzle-orm";
import { setCorsHeaders, logError, parseJsonBody } from "./_utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res, 'GET,POST,PUT,DELETE,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const userId = url.searchParams.get('userId');
  const itemId = url.searchParams.get('itemId');

  try {
    if (req.method === 'GET' && userId) {
      return await getUserCart(req, res, parseInt(userId));
    } else if (req.method === 'POST') {
      return await addToCart(req, res);
    } else if (req.method === 'PUT' && itemId) {
      return await updateCartItem(req, res, parseInt(itemId));
    } else if (req.method === 'DELETE' && itemId) {
      return await deleteCartItem(req, res, parseInt(itemId));
    } else {
      return res.status(400).json({ error: 'Invalid request. Use GET with userId, POST for add, PUT/DELETE with itemId' });
    }
  } catch (error) {
    logError("Cart error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getUserCart(req: VercelRequest, res: VercelResponse, userId: number) {
  if (isNaN(userId)) {
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
      .where(eq(cartItems.userId, userId));
    
    res.json({ cartItems: cartData });
  } catch (error) {
    logError("Get cart error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function addToCart(req: VercelRequest, res: VercelResponse) {
  try {
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
    logError("Add to cart error", error);
    if (error instanceof Error && error.message.includes('parse')) {
      res.status(400).json({ error: "Invalid request data" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

async function updateCartItem(req: VercelRequest, res: VercelResponse, cartId: number) {
  if (isNaN(cartId)) {
    return res.status(400).json({ error: "Invalid cart item ID" });
  }

  try {
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
  } catch (error) {
    logError("Update cart item error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteCartItem(req: VercelRequest, res: VercelResponse, cartId: number) {
  if (isNaN(cartId)) {
    return res.status(400).json({ error: "Invalid cart item ID" });
  }

  try {
    await db.delete(cartItems).where(eq(cartItems.id, cartId));
    res.json({ success: true });
  } catch (error) {
    logError("Delete cart item error", error);
    res.status(500).json({ error: "Internal server error" });
  }
}