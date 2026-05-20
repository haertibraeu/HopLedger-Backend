import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";
import { brewersRouter } from "./routes/brewers.js";
import { beersRouter } from "./routes/beers.js";
import { locationsRouter } from "./routes/locations.js";
import { containerTypesRouter } from "./routes/containerTypes.js";
import { containersRouter } from "./routes/containers.js";
import { accountingRouter } from "./routes/accounting.js";
import { actionsRouter } from "./routes/actions.js";
import { categoriesRouter } from "./routes/categories.js";
import { publicRouter } from "./routes/public.js";
import { backupRouter } from "./routes/backup.js";
import { apiKeyAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Public routes (no auth)
  app.use("/api/health", healthRouter);
  app.use("/api/public", publicRouter);

  // Protected routes (API key required)
  app.use("/api", apiKeyAuth);
  app.use("/api/brewers", brewersRouter);
  app.use("/api/beers", beersRouter);
  app.use("/api/locations", locationsRouter);
  app.use("/api/container-types", containerTypesRouter);
  app.use("/api/containers", containersRouter);
  app.use("/api/accounting", accountingRouter);
  app.use("/api/actions", actionsRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/backup", backupRouter);

  // Error handling
  app.use(errorHandler);

  return app;
}
