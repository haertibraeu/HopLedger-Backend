import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getParam } from "../utils/params";

export const containerTypesRouter = Router();

// List all container types
containerTypesRouter.get("/", async (_req: Request, res: Response) => {
  const types = await prisma.containerType.findMany({
    orderBy: { name: "asc" },
  });
  res.json(types);
});

// Get single container type
containerTypesRouter.get("/:id", async (req: Request, res: Response) => {
  const type = await prisma.containerType.findUnique({
    where: { id: getParam(req, "id") },
  });
  if (!type) {
    res.status(404).json({ error: "Container type not found" });
    return;
  }
  res.json(type);
});

// Create container type
containerTypesRouter.post("/", async (req: Request, res: Response) => {
  const { name, icon, externalPrice, internalPrice, depositFee } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const type = await prisma.containerType.create({
    data: {
      name: name.trim(),
      icon: icon?.trim() || null,
      externalPrice: Number(externalPrice) || 0,
      internalPrice: Number(internalPrice) || 0,
      depositFee: Number(depositFee) || 0,
    },
  });
  res.status(201).json(type);
});

// Update container type
containerTypesRouter.put("/:id", async (req: Request, res: Response) => {
  const { name, icon, externalPrice, internalPrice, depositFee } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  try {
    const type = await prisma.containerType.update({
      where: { id: getParam(req, "id") },
      data: {
        name: name.trim(),
        icon: icon?.trim() || null,
        externalPrice: Number(externalPrice) || 0,
        internalPrice: Number(internalPrice) || 0,
        depositFee: Number(depositFee) || 0,
      },
    });
    res.json(type);
  } catch {
    res.status(404).json({ error: "Container type not found" });
  }
});

// Delete container type
containerTypesRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.containerType.delete({
      where: { id: getParam(req, "id") },
    });
    res.status(204).send();
  } catch {
    res.status(409).json({
      error: "Cannot delete container type — may have containers assigned",
    });
  }
});
