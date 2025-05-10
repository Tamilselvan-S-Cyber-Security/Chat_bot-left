import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to check server status
  app.get("/api/status", (req, res) => {
    res.json({ status: "online", message: "Cyber Wolf Chat API is running" });
  });

  // API route to handle user validation
  app.get("/api/validate-user/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const user = await storage.getUserByUsername(username);
      res.json({ exists: !!user });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Placeholder for Firebase webhook integration if needed
  app.post("/api/hooks/firebase", (req, res) => {
    // This could be used for Firebase Cloud Functions webhooks
    // or server-side event processing if needed
    res.status(200).json({ received: true });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
