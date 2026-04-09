import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getParam } from "../utils/params";

export const brewersRouter = Router();

// List all brewers
brewersRouter.get("/", async (_req: Request, res: Response) => {
  const brewers = await prisma.brewer.findMany({
    orderBy: { name: "asc" },
  });
  res.json(brewers);
});

// Get single brewer
brewersRouter.get("/:id", async (req: Request, res: Response) => {
  const brewer = await prisma.brewer.findUnique({
    where: { id: getParam(req, "id") },
  });
  if (!brewer) {
    res.status(404).json({ error: "Brewer not found" });
    return;
  }
  res.json(brewer);
});

// Create brewer
brewersRouter.post("/", async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const brewer = await prisma.brewer.create({
    data: { name: name.trim() },
  });
  res.status(201).json(brewer);
});

// Update brewer
brewersRouter.put("/:id", async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  try {
    const brewer = await prisma.brewer.update({
      where: { id: getParam(req, "id") },
      data: { name: name.trim() },
    });
    res.json(brewer);
  } catch {
    res.status(404).json({ error: "Brewer not found" });
  }
});

// Delete brewer
brewersRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = getParam(req, "id");
  const brewer = await prisma.brewer.findUnique({ where: { id } });
  if (!brewer) {
    res.status(404).json({ error: "Brewer not found" });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.accountEntry.updateMany({ where: { brewerId: id }, data: { brewerId: null } });
    await tx.location.updateMany({ where: { brewerId: id }, data: { brewerId: null } });
    await tx.brewer.delete({ where: { id } });
  });

  res.status(204).send();
});
