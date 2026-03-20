import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getParam } from "../utils/params";

export const locationsRouter = Router();

// List all locations (with optional type filter)
locationsRouter.get("/", async (req: Request, res: Response) => {
  const { type } = req.query;
  const where = type && typeof type === "string" ? { type } : {};
  const locations = await prisma.location.findMany({
    where,
    orderBy: { name: "asc" },
  });
  res.json(locations);
});

// Get single location
locationsRouter.get("/:id", async (req: Request, res: Response) => {
  const location = await prisma.location.findUnique({
    where: { id: getParam(req, "id") },
  });
  if (!location) {
    res.status(404).json({ error: "Location not found" });
    return;
  }
  res.json(location);
});

// Create location
locationsRouter.post("/", async (req: Request, res: Response) => {
  const { name, type, brewerId } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const location = await prisma.location.create({
    data: {
      name: name.trim(),
      type: type?.trim() || "general",
      brewerId: brewerId || null,
    },
  });
  res.status(201).json(location);
});

// Update location
locationsRouter.put("/:id", async (req: Request, res: Response) => {
  const { name, type, brewerId } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  try {
    const location = await prisma.location.update({
      where: { id: getParam(req, "id") },
      data: {
        name: name.trim(),
        type: type?.trim() || "general",
        brewerId: brewerId || null,
      },
    });
    res.json(location);
  } catch {
    res.status(404).json({ error: "Location not found" });
  }
});

// Delete location
locationsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.location.delete({
      where: { id: getParam(req, "id") },
    });
    res.status(204).send();
  } catch {
    res.status(409).json({
      error: "Cannot delete location — may have containers assigned",
    });
  }
});
