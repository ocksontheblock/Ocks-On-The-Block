import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { sendWelcomeEmail } from "./emailService";
import { authRateLimit, signupRateLimit, emailSignupRateLimit, apiRateLimit } from "./rateLimiting";
import { optimizeSession, cacheUser, getCachedUser, clearUserCache, monitorDatabasePerformance } from "./sessionOptimizations";
import { addSecurityHeaders, sanitizeUserInput, validatePasswordStrength, detectSuspiciousActivity, validateSession } from "./securityMiddleware";
import Stripe from "stripe";

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
  userMysteryBoxes,
  userFigurines,
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
import { brevoService } from "./brevoService";

// Initialize Stripe lazily to avoid blocking startup
let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

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
        logError("Failed to send welcome email during registration", emailError);
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
      logError("Failed to unsubscribe user from email list", error);
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
      logError("Failed to fetch user purchases", error);
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
      logError("Failed to update user profile", error);
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
      logError("Failed to update user password", error);
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
        purchases: await db
          .select()
          .from(userMysteryBoxes)
          .where(eq(userMysteryBoxes.userId, userId)),
        cartItems: await db
          .select()
          .from(cartItems)
          .where(eq(cartItems.userId, userId)),
        exportDate: new Date().toISOString(),
      };
      
      res.json(userData);
    } catch (error) {
      logError("Failed to export user data", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  app.delete("/api/user/account", async (req, res) => {
    try {
      const userId = req.body.userId; // This should come from authentication middleware
      
      // Delete related data before deleting user
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
      await db.delete(userMysteryBoxes).where(eq(userMysteryBoxes.userId, userId));
      await db.delete(scavengerHuntParticipants).where(eq(scavengerHuntParticipants.userId, userId));
      
      // Delete user account
      await db.delete(users).where(eq(users.id, userId));
      
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      logError("Failed to delete user account", error);
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
      
      // Validate quantity
      const quantity = cartData.quantity || 1;
      if (typeof quantity !== 'number' || quantity <= 0 || quantity > 99) {
        return res.status(400).json({ "error": "Invalid quantity" });
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
          return res.status(400).json({ "error": "Invalid quantity" });
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
      res.status(400).json({ error: "Invalid cart data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      // Validate quantity
      if (typeof quantity !== 'number' || quantity <= 0 || quantity > 99) {
        return res.status(400).json({ "error": "Invalid quantity" });
      }
      
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

      // Get user details for Brevo
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      const [participant] = await db
        .insert(scavengerHuntParticipants)
        .values({ userId })
        .returning();

      // Send Brevo welcome email
      if (user?.email) {
        try {
          await brevoService.addScavengerHuntContact(
            user.email, 
            user.firstName || undefined, 
            user.lastName || undefined
          );
          await brevoService.sendScavengerHuntWelcomeEmail(
            user.email, 
            user.firstName || undefined
          );
          console.log(`Brevo welcome email sent to ${user.email}`);
        } catch (brevoError) {
          logError("Brevo email service failed during scavenger hunt join", brevoError);
          // Don't fail the registration if email fails
        }
      }
      
      res.json({ participant });
    } catch (error) {
      logError("Failed to join scavenger hunt", error);
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
      logError("Failed to fetch scavenger hunt leaderboard", error);
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
      logError("Failed to fetch scavenger hunt prizes", error);
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
      logError("Failed to create scavenger hunt prize", error);
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
      logError("Failed to submit scavenger hunt answer", error);
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
      logError("Failed to fetch user progress", error);
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

      const paymentIntent = await getStripe().paymentIntents.create({
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
      logError("Stripe payment processing failed", error);
      res.status(500).json({ 
        error: "Error creating payment intent",
        message: error.message 
      });
    }
  });

  // Stripe webhook for payment completion
  app.post("/api/webhooks/stripe", async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      // Validate webhook secret is configured
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        logError("STRIPE_WEBHOOK_SECRET is not configured", new Error("Missing webhook secret"));
        return res.status(500).send("Webhook configuration error");
      }

      // CRITICAL: Use req.body as Buffer (raw body from express.raw middleware)
      // Stripe requires the raw body for signature verification, not parsed JSON
      event = getStripe().webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
    } catch (err: any) {
      logError(`Stripe webhook signature verification failed`, err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the payment intent success event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        await fulfillMysteryBoxOrder(paymentIntent);
        console.log('Order fulfilled for payment:', paymentIntent.id);
      } catch (error) {
        logError("Order fulfillment failed after payment success", error);
      }
    }

    res.json({ received: true });
  });

  // Order fulfillment function
  async function fulfillMysteryBoxOrder(paymentIntent: Stripe.PaymentIntent) {
    const { userId, mysteryBoxId, quantity } = paymentIntent.metadata;
    
    if (!userId || !mysteryBoxId || !quantity) {
      throw new Error('Missing order metadata');
    }

    // Create the purchase record
    const [purchase] = await db
      .insert(userMysteryBoxes)
      .values({
        userId: parseInt(userId),
        mysteryBoxId: parseInt(mysteryBoxId),
        stripePaymentId: paymentIntent.id,
        isOpened: false,
        figuresReceived: []
      })
      .returning();

    // Generate random figurines based on mystery box tier
    const [mysteryBox] = await db
      .select()
      .from(mysteryBoxes)
      .where(eq(mysteryBoxes.id, parseInt(mysteryBoxId)));

    if (mysteryBox) {
      const figurinesToGenerate = parseInt(quantity);
      for (let i = 0; i < figurinesToGenerate; i++) {
        await generateRandomFigurine(parseInt(userId), purchase.id, mysteryBox.tier);
      }
    }
  }

  // Generate random figurine based on tier
  async function generateRandomFigurine(userId: number, purchaseId: number, tier: number) {
    const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
    const ockNames = ['Big Tony', 'Mama Rosa', 'Cool Dre', 'Señor Miguel', 'Uncle Sam'];
    
    // Determine rarity based on tier and random chance
    let rarity = 'common';
    const rarityRoll = Math.random();
    
    switch (tier) {
      case 1: // $29 tier
        if (rarityRoll < 0.05) rarity = 'rare';
        break;
      case 2: // $49 tier  
        if (rarityRoll < 0.15) rarity = 'rare';
        else if (rarityRoll < 0.02) rarity = 'elite';
        break;
      case 3: // $89 tier
        if (rarityRoll < 0.25) rarity = 'rare';
        else if (rarityRoll < 0.08) rarity = 'elite';
        else if (rarityRoll < 0.01) rarity = 'legendary';
        break;
      case 4: // $149 tier
        if (rarityRoll < 0.35) rarity = 'rare';
        else if (rarityRoll < 0.15) rarity = 'elite';
        else if (rarityRoll < 0.03) rarity = 'legendary';
        break;
    }

    const borough = boroughs[Math.floor(Math.random() * boroughs.length)];
    const ockName = ockNames[Math.floor(Math.random() * ockNames.length)];
    const figurineId = `${ockName.toLowerCase().replace(' ', '_')}_${borough.toLowerCase()}_${rarity}`;
    
    await db.insert(userFigurines).values({
      userId,
      figurineId,
      figurineName: `${ockName} of ${borough}`,
      rarity,
      borough,
      ockName,
      mysteryBoxPurchaseId: purchaseId,
      isUsedInHunt: false,
    });
  }

  // Admin routes for managing the hunt
  app.get("/api/admin/submissions/pending", async (req, res) => {
    try {
      // TODO: Add admin authentication check
      const pendingSubmissions = await db
        .select({
          id: scavengerHuntSubmissions.id,
          participantName: users.username,
          ockName: ocks.name,
          photoUrl: scavengerHuntSubmissions.photoUrl,
          figurineRarity: scavengerHuntSubmissions.figurineRarity,
          submittedAt: scavengerHuntSubmissions.submittedAt,
          gpsCoordinates: scavengerHuntSubmissions.gpsCoordinates,
        })
        .from(scavengerHuntSubmissions)
        .leftJoin(scavengerHuntParticipants, eq(scavengerHuntSubmissions.participantId, scavengerHuntParticipants.id))
        .leftJoin(users, eq(scavengerHuntParticipants.userId, users.id))
        .leftJoin(ocks, eq(scavengerHuntSubmissions.ockId, ocks.id))
        .where(eq(scavengerHuntSubmissions.verificationStatus, 'pending'))
        .orderBy(desc(scavengerHuntSubmissions.submittedAt));
      
      res.json(pendingSubmissions);
    } catch (error) {
      logError("Failed to fetch admin submissions", error);
      res.status(500).json({ error: "Failed to fetch pending submissions" });
    }
  });

  app.post("/api/admin/submissions/:id/verify", async (req, res) => {
    try {
      // TODO: Add admin authentication check
      const submissionId = parseInt(req.params.id);
      const { status, adminNotes, reviewedBy } = req.body; // approved or rejected
      
      const [submission] = await db
        .update(scavengerHuntSubmissions)
        .set({
          verificationStatus: status,
          adminNotes,
          reviewedBy,
          verifiedAt: new Date(),
        })
        .where(eq(scavengerHuntSubmissions.id, submissionId))
        .returning();

      // If approved, update participant's totals
      if (status === 'approved') {
        const [participant] = await db
          .select()
          .from(scavengerHuntParticipants)
          .where(eq(scavengerHuntParticipants.id, submission.participantId));

        if (participant) {
          await db
            .update(scavengerHuntParticipants)
            .set({
              totalOcksFound: (participant.totalOcksFound || 0) + 1,
              totalPoints: (participant.totalPoints || 0) + (submission.points || 0),
            })
            .where(eq(scavengerHuntParticipants.id, participant.id));
        }
      }
      
      res.json({ submission });
    } catch (error) {
      logError("Failed to verify admin submission", error);
      res.status(500).json({ error: "Failed to verify submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
