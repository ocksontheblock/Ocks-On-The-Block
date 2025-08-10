import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  emailAlerts: boolean("email_alerts").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

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
});

export const emailSignups = pgTable("email_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  active: boolean("active").default(true),
});

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

export const locationsRelations = relations(locations, ({ one }) => ({
  ock: one(ocks, {
    fields: [locations.ockName],
    references: [ocks.name],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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
