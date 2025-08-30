import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  emailAlerts: boolean("email_alerts").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  usernameIdx: index("users_username_idx").on(table.username),
  createdAtIdx: index("users_created_at_idx").on(table.createdAt),
}));

export const mysteryBoxes = pgTable("mystery_boxes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  tier: integer("tier").notNull(),
  image: text("image").notNull(),
  inStock: boolean("in_stock").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  mysteryBoxId: integer("mystery_box_id").references(() => mysteryBoxes.id),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("cart_items_user_id_idx").on(table.userId),
  mysteryBoxIdIdx: index("cart_items_mystery_box_id_idx").on(table.mysteryBoxId),
}));

export const emailSignups = pgTable("email_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  active: boolean("active").default(true),
}, (table) => ({
  emailIdx: index("email_signups_email_idx").on(table.email),
  activeIdx: index("email_signups_active_idx").on(table.active),
  subscribedAtIdx: index("email_signups_subscribed_at_idx").on(table.subscribedAt),
}));

export const ocks = pgTable("ocks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  featured: boolean("featured").default(false),
});

export const merchandise = pgTable("merchandise", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  image: text("image").notNull(),
  price: integer("price"),
  category: text("category").notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  borough: text("borough").notNull(),
  address: text("address").notNull(),
  ockName: text("ock_name").notNull(),
  verified: boolean("verified").default(false),
});

// Scavenger Hunt Tables
export const scavengerHuntParticipants = pgTable("scavenger_hunt_participants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("active"), // active, completed, disqualified
  totalOcksFound: integer("total_ocks_found").default(0),
  totalPoints: integer("total_points").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("scavenger_hunt_participants_user_id_idx").on(table.userId),
  statusIdx: index("scavenger_hunt_participants_status_idx").on(table.status),
  totalPointsIdx: index("scavenger_hunt_participants_total_points_idx").on(table.totalPoints),
  joinedAtIdx: index("scavenger_hunt_participants_joined_at_idx").on(table.joinedAt),
}));

export const scavengerHuntSubmissions = pgTable("scavenger_hunt_submissions", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").references(() => scavengerHuntParticipants.id).notNull(),
  figurineId: integer("figurine_id").references(() => userFigurines.id), // Link to owned figurine
  ockId: integer("ock_id").references(() => ocks.id).notNull(),
  locationId: integer("location_id").references(() => locations.id).notNull(),
  photoUrl: text("photo_url").notNull(),
  figurineRarity: text("figurine_rarity").notNull(), // common, rare, elite, legendary
  gpsCoordinates: varchar("gps_coordinates"),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, approved, rejected
  points: integer("points").default(0),
  submittedAt: timestamp("submitted_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  adminNotes: text("admin_notes"),
}, (table) => ({
  participantIdIdx: index("scavenger_hunt_submissions_participant_id_idx").on(table.participantId),
  ockIdIdx: index("scavenger_hunt_submissions_ock_id_idx").on(table.ockId),
  locationIdIdx: index("scavenger_hunt_submissions_location_id_idx").on(table.locationId),
  verificationStatusIdx: index("scavenger_hunt_submissions_verification_status_idx").on(table.verificationStatus),
  submittedAtIdx: index("scavenger_hunt_submissions_submitted_at_idx").on(table.submittedAt),
  pointsIdx: index("scavenger_hunt_submissions_points_idx").on(table.points),
}));

export const scavengerHuntPrizes = pgTable("scavenger_hunt_prizes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rarity: text("rarity").notNull(), // common, rare, elite, legendary, grand_prize
  minOcksRequired: integer("min_ocks_required").notNull(),
  minPoints: integer("min_points").notNull(),
  prizeValue: decimal("prize_value", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  available: boolean("available").default(true),
});

// User mystery box purchases
export const userMysteryBoxes = pgTable("user_mystery_boxes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  mysteryBoxId: integer("mystery_box_id").references(() => mysteryBoxes.id),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  stripePaymentId: varchar("stripe_payment_id"),
  isOpened: boolean("is_opened").default(false),
  figuresReceived: jsonb("figures_received"), // Array of figurines received
}, (table) => ({
  userIdIdx: index("user_mystery_boxes_user_id_idx").on(table.userId),
  purchaseDateIdx: index("user_mystery_boxes_purchase_date_idx").on(table.purchaseDate),
  stripePaymentIdIdx: index("user_mystery_boxes_stripe_payment_id_idx").on(table.stripePaymentId),
}));

// User figurine inventory
export const userFigurines = pgTable("user_figurines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  figurineId: varchar("figurine_id").notNull(), // Unique ID for each figurine type
  figurineName: varchar("figurine_name").notNull(),
  rarity: varchar("rarity").notNull(), // 'common', 'rare', 'elite', 'legendary'
  borough: varchar("borough").notNull(),
  ockName: varchar("ock_name").notNull(),
  acquiredDate: timestamp("acquired_date").defaultNow(),
  mysteryBoxPurchaseId: integer("mystery_box_purchase_id").references(() => userMysteryBoxes.id),
  isUsedInHunt: boolean("is_used_in_hunt").default(false),
}, (table) => ({
  userIdIdx: index("user_figurines_user_id_idx").on(table.userId),
  rarityIdx: index("user_figurines_rarity_idx").on(table.rarity),
  boroughIdx: index("user_figurines_borough_idx").on(table.borough),
  acquiredDateIdx: index("user_figurines_acquired_date_idx").on(table.acquiredDate),
  mysteryBoxPurchaseIdIdx: index("user_figurines_mystery_box_purchase_id_idx").on(table.mysteryBoxPurchaseId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const mysteryBoxesRelations = relations(mysteryBoxes, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  mysteryBox: one(mysteryBoxes, {
    fields: [cartItems.mysteryBoxId],
    references: [mysteryBoxes.id],
  }),
}));

export const ocksRelations = relations(ocks, ({ many }) => ({
  locations: many(locations),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  ock: one(ocks, {
    fields: [locations.ockName],
    references: [ocks.name],
  }),
  submissions: many(scavengerHuntSubmissions),
}));

export const userMysteryBoxesRelations = relations(userMysteryBoxes, ({ one, many }) => ({
  user: one(users, {
    fields: [userMysteryBoxes.userId],
    references: [users.id],
  }),
  mysteryBox: one(mysteryBoxes, {
    fields: [userMysteryBoxes.mysteryBoxId],
    references: [mysteryBoxes.id],
  }),
  figurines: many(userFigurines),
}));

export const userFigurinesRelations = relations(userFigurines, ({ one, many }) => ({
  user: one(users, {
    fields: [userFigurines.userId],
    references: [users.id],
  }),
  mysteryBoxPurchase: one(userMysteryBoxes, {
    fields: [userFigurines.mysteryBoxPurchaseId],
    references: [userMysteryBoxes.id],
  }),
  huntSubmissions: many(scavengerHuntSubmissions),
}));

// Scavenger Hunt Relations
export const scavengerHuntParticipantsRelations = relations(scavengerHuntParticipants, ({ one, many }) => ({
  user: one(users, {
    fields: [scavengerHuntParticipants.userId],
    references: [users.id],
  }),
  submissions: many(scavengerHuntSubmissions),
}));

export const scavengerHuntSubmissionsRelations = relations(scavengerHuntSubmissions, ({ one }) => ({
  participant: one(scavengerHuntParticipants, {
    fields: [scavengerHuntSubmissions.participantId],
    references: [scavengerHuntParticipants.id],
  }),
  figurine: one(userFigurines, {
    fields: [scavengerHuntSubmissions.figurineId],
    references: [userFigurines.id],
  }),
  ock: one(ocks, {
    fields: [scavengerHuntSubmissions.ockId],
    references: [ocks.id],
  }),
  location: one(locations, {
    fields: [scavengerHuntSubmissions.locationId],
    references: [locations.id],
  }),
  reviewer: one(users, {
    fields: [scavengerHuntSubmissions.reviewedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const insertMysteryBoxSchema = createInsertSchema(mysteryBoxes).omit({
  id: true,
  created_at: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertEmailSignupSchema = createInsertSchema(emailSignups).omit({
  id: true,
  subscribedAt: true,
});

export const insertOckSchema = createInsertSchema(ocks).omit({
  id: true,
});

export const insertMerchandiseSchema = createInsertSchema(merchandise).omit({
  id: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export const insertScavengerHuntParticipantSchema = createInsertSchema(scavengerHuntParticipants).omit({
  id: true,
  joinedAt: true,
  completedAt: true,
});

export const insertScavengerHuntSubmissionSchema = createInsertSchema(scavengerHuntSubmissions).omit({
  id: true,
  submittedAt: true,
  verifiedAt: true,
});

export const insertScavengerHuntPrizeSchema = createInsertSchema(scavengerHuntPrizes).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMysteryBox = z.infer<typeof insertMysteryBoxSchema>;
export type MysteryBox = typeof mysteryBoxes.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertEmailSignup = z.infer<typeof insertEmailSignupSchema>;
export type EmailSignup = typeof emailSignups.$inferSelect;
export type InsertOck = z.infer<typeof insertOckSchema>;
export type Ock = typeof ocks.$inferSelect;
export type InsertMerchandise = z.infer<typeof insertMerchandiseSchema>;
export type Merchandise = typeof merchandise.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertScavengerHuntParticipant = z.infer<typeof insertScavengerHuntParticipantSchema>;
export type ScavengerHuntParticipant = typeof scavengerHuntParticipants.$inferSelect;
export type InsertScavengerHuntSubmission = z.infer<typeof insertScavengerHuntSubmissionSchema>;
export type ScavengerHuntSubmission = typeof scavengerHuntSubmissions.$inferSelect;
export type InsertScavengerHuntPrize = z.infer<typeof insertScavengerHuntPrizeSchema>;
export type ScavengerHuntPrize = typeof scavengerHuntPrizes.$inferSelect;
