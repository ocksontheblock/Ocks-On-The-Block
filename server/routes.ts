import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { sendWelcomeEmail } from "./emailService";
import { authRateLimit, signupRateLimit, emailSignupRateLimit, apiRateLimit } from "./rateLimiting";
import { optimizeSession, cacheUser, getCachedUser, clearUserCache, monitorDatabasePerformance } from "./sessionOptimizations";
import { addSecurityHeaders, sanitizeUserInput, validatePasswordStrength, detectSuspiciousActivity, validateSession } from "./securityMiddleware";
import Stripe from "stripe";
import { 
  users, 
  mysteryBoxes, 
  cartItems, 
  emailSignups,
  scavengerHuntParticipants,
  scavengerHuntSubmissions,
  scavengerHuntPrizes,
  ocks,
  locations,
  type InsertUser, 
  type InsertMysteryBox,
  type InsertCartItem,
  type InsertEmailSignup,
  type InsertScavengerHuntParticipant,
  type InsertScavengerHuntSubmission,
  insertUserSchema,
  insertMysteryBoxSchema,
  insertCartItemSchema,
  insertEmailSignupSchema,
  insertScavengerHuntParticipantSchema,
  insertScavengerHuntSubmissionSchema,
  insertScavengerHuntPrizeSchema,
  loginUserSchema
} from "@shared/schema";
import { eq, and, desc, count, ne } from "drizzle-orm";
import bcrypt from "bcrypt";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Add security middleware
  app.use(addSecurityHeaders);
  app.use(detectSuspiciousActivity);
  app.use(validateSession);
  
  // Add session optimizations middleware
  app.use(optimizeSession);
  
  // Start database performance monitoring
  monitorDatabasePerformance();
  
  // Email signup route with rate limiting
  app.post("/api/email-signup", emailSignupRateLimit, async (req, res) => {
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
      
      // Send welcome email
      try {
        await sendWelcomeEmail(signup.email, signup.id);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the signup if email fails
      }
      
      res.json({ signup });
    } catch (error) {
      res.status(400).json({ error: "Invalid signup data" });
    }
  });

  // Unsubscribe route
  app.post("/api/unsubscribe", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: "Token required" });
      }
      
      // Decode the token
      let decodedData;
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [id, email] = decoded.split(':');
        decodedData = { id: parseInt(id), email };
      } catch (error) {
        return res.status(400).json({ error: "Invalid token" });
      }
      
      // Find and update the email signup
      const [signup] = await db
        .select()
        .from(emailSignups)
        .where(and(
          eq(emailSignups.id, decodedData.id),
          eq(emailSignups.email, decodedData.email)
        ));
      
      if (!signup) {
        return res.status(404).json({ error: "Email subscription not found" });
      }
      
      // Deactivate the subscription
      await db
        .update(emailSignups)
        .set({ active: false })
        .where(eq(emailSignups.id, signup.id));
      
      res.json({ email: signup.email, message: "Successfully unsubscribed" });
    } catch (error) {
      console.error('Unsubscribe error:', error);
      res.status(500).json({ error: "Failed to unsubscribe" });
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

  // User account management routes
  app.get("/api/user/purchases/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // TODO: Replace with actual purchase query from database
      // This is a placeholder until we have a proper purchases table
      const purchases: any[] = [];
      
      res.json(purchases);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  app.put("/api/user/profile", async (req, res) => {
    try {
      // Extract user ID from session/token (placeholder for now)
      const userId = req.body.userId; // This should come from authentication middleware
      
      const { username, email, firstName, lastName } = req.body;
      
      // Check if email is already taken by another user
      if (email) {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(and(
            eq(users.email, email),
            ne(users.id, userId)
          ));
        
        if (existingUser) {
          return res.status(409).json({ error: "Email already in use" });
        }
      }
      
      const [updatedUser] = await db
        .update(users)
        .set({
          username,
          email,
          firstName,
          lastName,
        })
        .where(eq(users.id, userId))
        .returning();
      
      res.json({ user: { ...updatedUser, password: undefined } });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.put("/api/user/password", async (req, res) => {
    try {
      const userId = req.body.userId; // This should come from authentication middleware
      const { currentPassword, newPassword } = req.body;
      
      // Get current user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await db
        .update(users)
        .set({ password: hashedNewPassword })
        .where(eq(users.id, userId));
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  app.post("/api/user/export-data", async (req, res) => {
    try {
      const userId = req.body.userId; // This should come from authentication middleware
      
      // Get user data
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Compile all user data
      const userData = {
        profile: {
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
        purchases: [], // TODO: Add actual purchase data
        cartItems: [], // TODO: Add cart items if any
        exportDate: new Date().toISOString(),
      };
      
      res.json(userData);
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  app.delete("/api/user/account", async (req, res) => {
    try {
      const userId = req.body.userId; // This should come from authentication middleware
      
      // Delete user account (this will cascade to related data)
      await db.delete(users).where(eq(users.id, userId));
      
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  // User authentication routes
  app.post("/api/auth/register", signupRateLimit, async (req, res) => {
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
      
      // Validate password strength
      const passwordValidation = validatePasswordStrength(userData.password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          error: "Password does not meet security requirements",
          details: passwordValidation.issues
        });
      }
      
      // Sanitize user input
      userData.username = sanitizeUserInput(userData.username);
      userData.email = sanitizeUserInput(userData.email);
      if (userData.firstName) userData.firstName = sanitizeUserInput(userData.firstName);
      if (userData.lastName) userData.lastName = sanitizeUserInput(userData.lastName);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
      
      const [user] = await db.insert(users).values(userData).returning();
      
      // Cache the new user for faster future lookups
      cacheUser(user.id, user);
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", authRateLimit, async (req, res) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, loginData.email));
      
      if (!user || !await bcrypt.compare(loginData.password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Cache the authenticated user
      cacheUser(user.id, user);
      
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
      const [existingItem] = await db
        .select()
        .from(cartItems)
        .where(and(
          eq(cartItems.userId, cartData.userId!),
          eq(cartItems.mysteryBoxId, cartData.mysteryBoxId!)
        ));
      
      if (existingItem) {
        // Update quantity
        const [updatedItem] = await db
          .update(cartItems)
          .set({ quantity: (existingItem.quantity || 0) + (cartData.quantity || 1) })
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

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity })
        .where(eq(cartItems.id, id))
        .returning();
      
      res.json({ cartItem: updatedItem });
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

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));
      
      if (existingEmail) {
        return res.status(409).json({ error: "Email already exists" });
      }

      // Check if username already exists
      const [existingUsername] = await db
        .select()
        .from(users)
        .where(eq(users.username, userData.username!));
      
      if (existingUsername) {
        return res.status(409).json({ error: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const [user] = await db
        .insert(users)
        .values({ ...userData, password: hashedPassword })
        .returning();
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", authRateLimit, async (req, res) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, loginData.email));
      
      if (!user || !await bcrypt.compare(loginData.password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Cache the authenticated user
      cacheUser(user.id, user);
      
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ error: "Invalid login data" });
    }
  });

  // Scavenger Hunt Routes
  
  // Join the scavenger hunt
  app.post("/api/scavenger-hunt/join", async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      // Check if user already joined
      const [existingParticipant] = await db
        .select()
        .from(scavengerHuntParticipants)
        .where(eq(scavengerHuntParticipants.userId, userId));
      
      if (existingParticipant) {
        return res.status(409).json({ error: "Already joined the hunt" });
      }

      const [participant] = await db
        .insert(scavengerHuntParticipants)
        .values({ userId })
        .returning();
      
      res.json({ participant });
    } catch (error) {
      console.error('Scavenger hunt join error:', error);
      res.status(500).json({ error: "Failed to join scavenger hunt" });
    }
  });

  // Get leaderboard
  app.get("/api/scavenger-hunt/leaderboard", async (req, res) => {
    try {
      const leaderboard = await db
        .select({
          id: scavengerHuntParticipants.id,
          username: users.email, // Using email as username for now
          totalOcksFound: scavengerHuntParticipants.totalOcksFound,
          totalPoints: scavengerHuntParticipants.totalPoints,
          status: scavengerHuntParticipants.status,
        })
        .from(scavengerHuntParticipants)
        .leftJoin(users, eq(scavengerHuntParticipants.userId, users.id))
        .orderBy(desc(scavengerHuntParticipants.totalPoints))
        .limit(50);
      
      res.json(leaderboard);
    } catch (error) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get available prizes
  app.get("/api/scavenger-hunt/prizes", async (req, res) => {
    try {
      const prizes = await db
        .select()
        .from(scavengerHuntPrizes)
        .where(eq(scavengerHuntPrizes.available, true))
        .orderBy(scavengerHuntPrizes.minPoints);
      
      res.json(prizes);
    } catch (error) {
      console.error('Prizes error:', error);
      res.status(500).json({ error: "Failed to fetch prizes" });
    }
  });

  // Create a prize (admin function)
  app.post("/api/scavenger-hunt/prizes", async (req, res) => {
    try {
      const prizeData = insertScavengerHuntPrizeSchema.parse(req.body);
      
      const [prize] = await db
        .insert(scavengerHuntPrizes)
        .values(prizeData)
        .returning();
      
      res.json({ prize });
    } catch (error) {
      console.error('Prize creation error:', error);
      res.status(400).json({ error: "Invalid prize data" });
    }
  });

  // Submit a photo for verification
  app.post("/api/scavenger-hunt/submit", async (req, res) => {
    try {
      const submissionData = insertScavengerHuntSubmissionSchema.parse(req.body);
      
      // Check if this participant already submitted for this ock
      const [existingSubmission] = await db
        .select()
        .from(scavengerHuntSubmissions)
        .where(and(
          eq(scavengerHuntSubmissions.participantId, submissionData.participantId),
          eq(scavengerHuntSubmissions.ockId, submissionData.ockId)
        ));
      
      if (existingSubmission) {
        return res.status(409).json({ error: "Already submitted for this Ock" });
      }

      // Calculate points based on rarity
      let points = 10; // base points
      switch (submissionData.figurineRarity) {
        case 'rare': points = 25; break;
        case 'elite': points = 50; break;
        case 'legendary': points = 100; break;
      }

      const [submission] = await db
        .insert(scavengerHuntSubmissions)
        .values({ ...submissionData, points })
        .returning();
      
      res.json({ submission });
    } catch (error) {
      console.error('Submission error:', error);
      res.status(400).json({ error: "Invalid submission data" });
    }
  });

  // Get participant's progress
  app.get("/api/scavenger-hunt/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const [participant] = await db
        .select()
        .from(scavengerHuntParticipants)
        .where(eq(scavengerHuntParticipants.userId, userId));
      
      if (!participant) {
        return res.status(404).json({ error: "Not participating in hunt" });
      }

      const submissions = await db
        .select({
          id: scavengerHuntSubmissions.id,
          ockName: ocks.name,
          figurineRarity: scavengerHuntSubmissions.figurineRarity,
          verificationStatus: scavengerHuntSubmissions.verificationStatus,
          points: scavengerHuntSubmissions.points,
          submittedAt: scavengerHuntSubmissions.submittedAt,
        })
        .from(scavengerHuntSubmissions)
        .leftJoin(ocks, eq(scavengerHuntSubmissions.ockId, ocks.id))
        .where(eq(scavengerHuntSubmissions.participantId, participant.id))
        .orderBy(desc(scavengerHuntSubmissions.submittedAt));
      
      res.json({ participant, submissions });
    } catch (error) {
      console.error('Progress error:', error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // Stripe payment route for mystery boxes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, currency = 'usd', metadata = {} } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          ...metadata,
          source: 'ocks-mystery-boxes'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      res.status(500).json({ 
        error: "Error creating payment intent",
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
