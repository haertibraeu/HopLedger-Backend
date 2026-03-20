import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health";
import { brewersRouter } from "./routes/brewers";
import { beersRouter } from "./routes/beers";
import { locationsRouter } from "./routes/locations";
import { containerTypesRouter } from "./routes/containerTypes";
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
  app.use("/api/brewers", brewersRouter);
  app.use("/api/beers", beersRouter);
  app.use("/api/locations", locationsRouter);
  app.use("/api/container-types", containerTypesRouter);

  // Error handling
  app.use(errorHandler);

  return app;
}
