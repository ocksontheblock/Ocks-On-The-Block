import { 
  users, 
  mysteryBoxes,
  userMysteryBoxes,
  userFigurines,
  type User, 
  type InsertUser,
  type MysteryBox,
  type InsertMysteryBox
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMysteryBoxes(): Promise<MysteryBox[]>;
  getUserFigurines(userId: number): Promise<any[]>;
  getUserPurchases(userId: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getMysteryBoxes(): Promise<MysteryBox[]> {
    return await db.select().from(mysteryBoxes);
  }

  async getUserFigurines(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(userFigurines)
      .where(eq(userFigurines.userId, userId));
  }

  async getUserPurchases(userId: number): Promise<any[]> {
    return await db
      .select({
        id: userMysteryBoxes.id,
        purchaseDate: userMysteryBoxes.purchaseDate,
        isOpened: userMysteryBoxes.isOpened,
        mysteryBox: {
          name: mysteryBoxes.name,
          description: mysteryBoxes.description,
          price: mysteryBoxes.price,
          tier: mysteryBoxes.tier,
        },
      })
      .from(userMysteryBoxes)
      .leftJoin(mysteryBoxes, eq(userMysteryBoxes.mysteryBoxId, mysteryBoxes.id))
      .where(eq(userMysteryBoxes.userId, userId));
  }
}

export const storage = new DatabaseStorage();
