import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health";
import { apiKeyAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Public routes
  app.use("/api/health", healthRouter);

  // Protected routes (API key required)
  app.use("/api", apiKeyAuth);

  // Error handling
  app.use(errorHandler);

  return app;
}
