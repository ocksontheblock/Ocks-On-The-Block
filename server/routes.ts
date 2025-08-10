import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { 
  users, 
  mysteryBoxes, 
  cartItems, 
  emailSignups,
  type InsertUser, 
  type InsertMysteryBox,
  type InsertCartItem,
  type InsertEmailSignup,
  insertUserSchema,
  insertMysteryBoxSchema,
  insertCartItemSchema,
  insertEmailSignupSchema,
  loginUserSchema
} from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Email signup route
  app.post("/api/email-signup", async (req, res) => {
    try {
      const signupData = insertEmailSignupSchema.parse(req.body);
      
      // Check if email already exists
      const [existingSignup] = await db
        .select()
        .from(emailSignups)
        .where(eq(emailSignups.email, signupData.email));
      
      if (existingSignup) {
        return res.status(409).json({ error: "Email already subscribed" });
      }
      
      const [signup] = await db
        .insert(emailSignups)
        .values(signupData)
        .returning();
      
      res.json({ signup });
    } catch (error) {
      res.status(400).json({ error: "Invalid signup data" });
    }
  });

  // Mystery boxes routes
  app.get("/api/mystery-boxes", async (req, res) => {
    try {
      const boxes = await db.select().from(mysteryBoxes);
      res.json({ mysteryBoxes: boxes });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mystery boxes" });
    }
  });

  // User authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));
      
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
      
      const [user] = await db.insert(users).values(userData).returning();
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, loginData.email));
      
      if (!user || !await bcrypt.compare(loginData.password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  // Cart routes
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
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
      res.status(400).json({ error: "Invalid user ID" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartData = insertCartItemSchema.parse(req.body);
      
      // Check if item already in cart
      const existingItems = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.userId, cartData.userId!));
      
      const existingItem = existingItems.find(item => item.mysteryBoxId === cartData.mysteryBoxId);
      
      if (existingItem) {
        // Update quantity
        const [updatedItem] = await db
          .update(cartItems)
          .set({ quantity: existingItem.quantity + (cartData.quantity || 1) })
          .where(eq(cartItems.id, existingItem.id))
          .returning();
        
        return res.json({ cartItem: updatedItem });
      }
      
      const [cartItem] = await db.insert(cartItems).values(cartData).returning();
      res.json({ cartItem });
    } catch (error) {
      res.status(400).json({ error: "Invalid cart data" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(cartItems).where(eq(cartItems.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid cart item ID" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
