import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getParam } from "../utils/params";

export const containersRouter = Router();

// List containers with filters
containersRouter.get("/", async (req: Request, res: Response) => {
  const { locationId, beerId, containerTypeId, isEmpty, isReserved } = req.query;

  const where: Record<string, unknown> = {};
  if (locationId && typeof locationId === "string") where["locationId"] = locationId;
  if (beerId && typeof beerId === "string") where["beerId"] = beerId;
  if (containerTypeId && typeof containerTypeId === "string") where["containerTypeId"] = containerTypeId;
  if (isEmpty === "true") where["isEmpty"] = true;
  if (isEmpty === "false") where["isEmpty"] = false;
  if (isReserved === "true") where["isReserved"] = true;
  if (isReserved === "false") where["isReserved"] = false;

  const containers = await prisma.container.findMany({
    where,
    include: {
      containerType: true,
      beer: true,
      location: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(containers);
});

// Get single container
containersRouter.get("/:id", async (req: Request, res: Response) => {
  const container = await prisma.container.findUnique({
    where: { id: getParam(req, "id") },
    include: {
      containerType: true,
      beer: true,
      location: true,
    },
  });
  if (!container) {
    res.status(404).json({ error: "Container not found" });
    return;
  }
  res.json(container);
});

// Create container
containersRouter.post("/", async (req: Request, res: Response) => {
  const { containerTypeId, locationId, beerId } = req.body;
  if (!containerTypeId || !locationId) {
    res.status(400).json({ error: "containerTypeId and locationId are required" });
    return;
  }
  const container = await prisma.container.create({
    data: {
      containerTypeId,
      locationId,
      beerId: beerId || null,
      isEmpty: !beerId,
    },
    include: { containerType: true, beer: true, location: true },
  });
  res.status(201).json(container);
});

// Delete container
containersRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.container.delete({
      where: { id: getParam(req, "id") },
    });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Container not found" });
  }
});

// Move container to new location
containersRouter.post("/:id/move", async (req: Request, res: Response) => {
  const { locationId } = req.body;
  if (!locationId) {
    res.status(400).json({ error: "locationId is required" });
    return;
  }
  try {
    const container = await prisma.container.update({
      where: { id: getParam(req, "id") },
      data: { locationId },
      include: { containerType: true, beer: true, location: true },
    });
    res.json(container);
  } catch {
    res.status(404).json({ error: "Container not found" });
  }
});

// Fill container with beer
containersRouter.post("/:id/fill", async (req: Request, res: Response) => {
  const { beerId } = req.body;
  if (!beerId) {
    res.status(400).json({ error: "beerId is required" });
    return;
  }

  const container = await prisma.container.findUnique({
    where: { id: getParam(req, "id") },
  });
  if (!container) {
    res.status(404).json({ error: "Container not found" });
    return;
  }
  if (!container.isEmpty) {
    res.status(422).json({ error: "Container is already filled" });
    return;
  }

  const updated = await prisma.container.update({
    where: { id: getParam(req, "id") },
    data: { beerId, isEmpty: false },
    include: { containerType: true, beer: true, location: true },
  });
  res.json(updated);
});

// Destroy beer (mark as empty, keep container)
containersRouter.post("/:id/destroy-beer", async (req: Request, res: Response) => {
  const container = await prisma.container.findUnique({
    where: { id: getParam(req, "id") },
  });
  if (!container) {
    res.status(404).json({ error: "Container not found" });
    return;
  }
  if (container.isEmpty) {
    res.status(422).json({ error: "Container is already empty" });
    return;
  }

  const updated = await prisma.container.update({
    where: { id: getParam(req, "id") },
    data: { beerId: null, isEmpty: true, isReserved: false, reservedFor: null },
    include: { containerType: true, beer: true, location: true },
  });
  res.json(updated);
});

// Reserve container
containersRouter.post("/:id/reserve", async (req: Request, res: Response) => {
  const { reservedFor } = req.body;
  if (!reservedFor || typeof reservedFor !== "string") {
    res.status(400).json({ error: "reservedFor (customer name) is required" });
    return;
  }

  const container = await prisma.container.findUnique({
    where: { id: getParam(req, "id") },
  });
  if (!container) {
    res.status(404).json({ error: "Container not found" });
    return;
  }
  if (container.isEmpty) {
    res.status(422).json({ error: "Cannot reserve an empty container" });
    return;
  }
  if (container.isReserved) {
    res.status(422).json({ error: "Container is already reserved" });
    return;
  }

  const updated = await prisma.container.update({
    where: { id: getParam(req, "id") },
    data: { isReserved: true, reservedFor: reservedFor.trim() },
    include: { containerType: true, beer: true, location: true },
  });
  res.json(updated);
});

// Unreserve container
containersRouter.post("/:id/unreserve", async (req: Request, res: Response) => {
  const container = await prisma.container.findUnique({
    where: { id: getParam(req, "id") },
  });
  if (!container) {
    res.status(404).json({ error: "Container not found" });
    return;
  }
  if (!container.isReserved) {
    res.status(422).json({ error: "Container is not reserved" });
    return;
  }

  const updated = await prisma.container.update({
    where: { id: getParam(req, "id") },
    data: { isReserved: false, reservedFor: null },
    include: { containerType: true, beer: true, location: true },
  });
  res.json(updated);
});

// Batch fill: fill multiple empty containers with same beer
containersRouter.post("/batch-fill", async (req: Request, res: Response) => {
  const { containerIds, beerId } = req.body;
  if (!beerId || !Array.isArray(containerIds) || containerIds.length === 0) {
    res.status(400).json({ error: "beerId and containerIds (array) are required" });
    return;
  }

  // Verify all containers exist and are empty
  const containers = await prisma.container.findMany({
    where: { id: { in: containerIds } },
  });

  if (containers.length !== containerIds.length) {
    res.status(404).json({ error: "One or more containers not found" });
    return;
  }

  const nonEmpty = containers.filter((c) => !c.isEmpty);
  if (nonEmpty.length > 0) {
    res.status(422).json({
      error: `${nonEmpty.length} container(s) are not empty`,
      containerIds: nonEmpty.map((c) => c.id),
    });
    return;
  }

  await prisma.container.updateMany({
    where: { id: { in: containerIds } },
    data: { beerId, isEmpty: false },
  });

  const updated = await prisma.container.findMany({
    where: { id: { in: containerIds } },
    include: { containerType: true, beer: true, location: true },
  });
  res.json(updated);
});
