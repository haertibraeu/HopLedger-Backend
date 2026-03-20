import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const healthRouter = Router();

healthRouter.get("/", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      service: "HopLedger Backend",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: "error",
      service: "HopLedger Backend",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});
