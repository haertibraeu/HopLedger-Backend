import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getParam } from "../utils/params";

export const beersRouter = Router();

// List all beers
beersRouter.get("/", async (_req: Request, res: Response) => {
  const beers = await prisma.beer.findMany({
    orderBy: { name: "asc" },
  });
  res.json(beers);
});

// Get single beer
beersRouter.get("/:id", async (req: Request, res: Response) => {
  const beer = await prisma.beer.findUnique({
    where: { id: getParam(req, "id") },
  });
  if (!beer) {
    res.status(404).json({ error: "Beer not found" });
    return;
  }
  res.json(beer);
});

// Create beer
beersRouter.post("/", async (req: Request, res: Response) => {
  const { name, style, batchId } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const beer = await prisma.beer.create({
    data: {
      name: name.trim(),
      style: style?.trim() || null,
      batchId: batchId?.trim() || null,
    },
  });
  res.status(201).json(beer);
});

// Update beer
beersRouter.put("/:id", async (req: Request, res: Response) => {
  const { name, style, batchId } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  try {
    const beer = await prisma.beer.update({
      where: { id: getParam(req, "id") },
      data: {
        name: name.trim(),
        style: style?.trim() || null,
        batchId: batchId?.trim() || null,
      },
    });
    res.json(beer);
  } catch {
    res.status(404).json({ error: "Beer not found" });
  }
});

// Delete beer
beersRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.beer.delete({
      where: { id: getParam(req, "id") },
    });
    res.status(204).send();
  } catch {
    res.status(409).json({
      error: "Cannot delete beer — may be assigned to containers",
    });
  }
});
