import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
export type User = typeof users.$inferSelect;
export type InsertOck = z.infer<typeof insertOckSchema>;
export type Ock = typeof ocks.$inferSelect;
export type InsertMerchandise = z.infer<typeof insertMerchandiseSchema>;
export type Merchandise = typeof merchandise.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
