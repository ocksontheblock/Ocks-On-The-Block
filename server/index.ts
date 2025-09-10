import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedInitialData } from "./seedData";

const app = express();

// CRITICAL: Raw body parsing for Stripe webhooks MUST come before express.json()
// Stripe requires the raw request body as Buffer for signature verification
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Standard JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory
app.use(express.static("public"));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Add timeout for startup operations in serverless environments
    const startupTimeout = process.env.VERCEL ? 30000 : 60000; // 30s for Vercel, 60s for others
    
    const startupPromise = (async () => {
      // Seed initial data on startup (skip in serverless to prevent cold start latency)
      if (!process.env.VERCEL) {
        await seedInitialData();
      }
      
      const server = await registerRoutes(app);

      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        throw err;
      });

      // importantly only setup vite in development and after
      // setting up all the other routes so the catch-all route
      // doesn't interfere with the other routes
      if (app.get("env") === "development") {
        await setupVite(app, server);
      } else if (!process.env.VERCEL) {
        // Only serve static files in non-Vercel environments
        // Vercel handles static file serving through its own routing
        serveStatic(app);
      }

      // Only start server if not in Vercel environment
      if (!process.env.VERCEL) {
        // ALWAYS serve the app on the port specified in the environment variable PORT
        // Other ports are firewalled. Default to 5000 if not specified.
        // this serves both the API and the client.
        // It is the only port that is not firewalled.
        const port = parseInt(process.env.PORT || '5000', 10);
        server.listen({
          port,
          host: "0.0.0.0",
          reusePort: true,
        }, () => {
          log(`serving on port ${port}`);
        });
      }
      
      return server;
    })();

    // Add timeout to prevent hanging in serverless environments
    await Promise.race([
      startupPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Server startup timeout after ${startupTimeout}ms`)), startupTimeout)
      )
    ]);

  } catch (error) {
    console.error({
      level: "error",
      message: "Server startup failed",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      isVercel: !!process.env.VERCEL
    });
    
    // In serverless environments, don't exit the process
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
})();

// Export the app for Vercel
export default app;
