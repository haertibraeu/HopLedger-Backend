import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health";
import { brewersRouter } from "./routes/brewers";
import { beersRouter } from "./routes/beers";
import { locationsRouter } from "./routes/locations";
import { containerTypesRouter } from "./routes/containerTypes";
import { containersRouter } from "./routes/containers";
import { accountingRouter } from "./routes/accounting";
import { actionsRouter } from "./routes/actions";
import { publicRouter } from "./routes/public";
import { apiKeyAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

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

  // Error handling
  app.use(errorHandler);

  return app;
}
