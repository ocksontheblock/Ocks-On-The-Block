import { db } from "./db";
import { mysteryBoxes, ocks, locations, scavengerHuntPrizes } from "@shared/schema";

export async function seedInitialData() {
  try {
    // Check if data already exists
    const existingBoxes = await db.select().from(mysteryBoxes);
    if (existingBoxes.length > 0) {
      console.log("Initial data already exists, skipping seed");
      return;
    }

    // Insert mystery boxes
    await db.insert(mysteryBoxes).values([
      {
        name: "Corner Store Starter",
        description: "Begin your Ocks collection with this starter pack featuring authentic NYC corner store figures",
        price: "29.00",
        tier: 1,
        image: "/api/placeholder/mystery-box-1",
        inStock: true,
      },
      {
        name: "Earner Box",
        description: "BEST VALUE - Premium collection with higher chance of rare Ocks figures",
        price: "49.00", 
        tier: 2,
        image: "/api/placeholder/mystery-box-2",
        inStock: true,
      },
      {
        name: "Block Legend Box",
        description: "Elite collection featuring legendary corner store figures with exclusive accessories",
        price: "89.00",
        tier: 3,
        image: "/api/placeholder/mystery-box-3", 
        inStock: true,
      },
      {
        name: "Don Box",
        description: "LIMITED EDITION - Ultra rare collection with guaranteed legendary figures",
        price: "149.00",
        tier: 4,
        image: "/api/placeholder/mystery-box-4",
        inStock: true,
      },
    ]);

    // Insert Ocks characters
    await db.insert(ocks).values([
      {
        name: "Big Tony",
        description: "The legendary corner store owner from Manhattan who knows everyone's name",
        image: "/api/placeholder/ock-big-tony",
        featured: true,
      },
      {
        name: "Mama Rosa",
        description: "Brooklyn's finest bodega queen, always has the freshest sandwiches",
        image: "/api/placeholder/ock-mama-rosa", 
        featured: true,
      },
      {
        name: "Cool Dre",
        description: "Queens' smoothest operator, master of the quick serve",
        image: "/api/placeholder/ock-cool-dre",
        featured: true,
      },
      {
        name: "Señor Miguel", 
        description: "Bronx corner store legend with the best coffee in the city",
        image: "/api/placeholder/ock-senor-miguel",
        featured: false,
      },
      {
        name: "Uncle Sam",
        description: "Staten Island's wise corner store keeper and community pillar",
        image: "/api/placeholder/ock-uncle-sam",
        featured: false,
      },
    ]);

    // Insert locations for scavenger hunt
    await db.insert(locations).values([
      {
        borough: "Manhattan",
        address: "Broadway & 125th St",
        ockName: "Big Tony",
        verified: true,
      },
      {
        borough: "Brooklyn", 
        address: "Atlantic Ave & Flatbush",
        ockName: "Mama Rosa",
        verified: true,
      },
      {
        borough: "Queens",
        address: "Queens Blvd & Roosevelt",
        ockName: "Cool Dre", 
        verified: true,
      },
      {
        borough: "Bronx",
        address: "Grand Concourse & 149th",
        ockName: "Señor Miguel",
        verified: true,
      },
      {
        borough: "Staten Island",
        address: "Victory Blvd & Forest Ave", 
        ockName: "Uncle Sam",
        verified: true,
      },
    ]);

    // Insert scavenger hunt prizes
    await db.insert(scavengerHuntPrizes).values([
      {
        name: "Bronze Ock Medal",
        description: "Commemorative medal for finding your first Ock",
        rarity: "common",
        minOcksRequired: 1,
        minPoints: 10,
        prizeValue: "25.00",
        available: true,
      },
      {
        name: "Silver Ock Chain",
        description: "Exclusive chain for dedicated Ock hunters",
        rarity: "rare", 
        minOcksRequired: 3,
        minPoints: 75,
        prizeValue: "100.00",
        available: true,
      },
      {
        name: "Gold Borough Crown",
        description: "Crown for mastering all 5 boroughs",
        rarity: "elite",
        minOcksRequired: 5,
        minPoints: 200,
        prizeValue: "500.00", 
        available: true,
      },
      {
        name: "GRAND PRIZE - $10,000",
        description: "Ultimate prize for the greatest Ock hunter",
        rarity: "grand_prize",
        minOcksRequired: 10,
        minPoints: 1000,
        prizeValue: "10000.00",
        available: true,
      },
    ]);

    console.log("✅ Initial data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}