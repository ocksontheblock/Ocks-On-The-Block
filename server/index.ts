import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Create HTTP server
const server = createServer(app);

// Standard JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory
app.use(express.static("public"));

// Basic middleware for logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Development API proxy - in development mode, proxy API calls to serverless function logic
app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/api/mystery-boxes", async (req, res) => {
  try {
    // Import here to avoid issues if modules aren't available
    const { db } = await import("./db");
    const { mysteryBoxes } = await import("../shared/schema");
    
    const boxes = await db.select().from(mysteryBoxes);
    res.json({ mysteryBoxes: boxes });
  } catch (error) {
    console.error("Mystery boxes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

(async () => {
  try {
    // Only run in development (not on Vercel)
    if (!process.env.VERCEL && app.get("env") === "development") {
      await setupVite(app, server);
      
      const port = parseInt(process.env.PORT || '5000', 10);
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      });
    }
  } catch (error) {
    console.error("Server startup failed:", error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
})();

// Export the app for Vercel (but it won't be used since we have file-based routing)
export default app;
