import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const actionsRouter = Router();

// Sell: move container to customer + credit brewer
actionsRouter.post("/sell", async (req: Request, res: Response) => {
  const { containerId, brewerId, customerLocationId, description } = req.body;

  if (!containerId || !brewerId || !customerLocationId) {
    res.status(400).json({
      error: "containerId, brewerId, and customerLocationId are required",
    });
    return;
  }

  const [container, brewer, location] = await Promise.all([
    prisma.container.findUnique({
      where: { id: containerId },
      include: { containerType: true },
    }),
    prisma.brewer.findUnique({ where: { id: brewerId } }),
    prisma.location.findUnique({ where: { id: customerLocationId } }),
  ]);

  if (!container) { res.status(404).json({ error: "Container not found" }); return; }
  if (!brewer) { res.status(404).json({ error: "Brewer not found" }); return; }
  if (!location) { res.status(404).json({ error: "Customer location not found" }); return; }
  if (container.isEmpty) {
    res.status(422).json({ error: "Cannot sell an empty container" });
    return;
  }

  const amount = container.containerType.externalPrice + container.containerType.depositFee;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.container.update({
      where: { id: containerId },
      data: {
        locationId: customerLocationId,
        beerId: null,
        isEmpty: true,
        isReserved: false,
        reservedFor: null,
      },
      include: { containerType: true, beer: true, location: true },
    });

    const entry = await tx.accountEntry.create({
      data: {
        brewerId,
        amount,
        type: "sale",
        description: description ?? `Sold ${container.containerType.name} to customer`,
      },
    });

    return { container: updated, accountEntry: entry };
  });

  res.json(result);
});

// Batch-sell: move multiple containers to customer + single combined accounting entry
actionsRouter.post("/batch-sell", async (req: Request, res: Response) => {
  const { containerIds, brewerId, customerLocationId, description } = req.body;

  if (!Array.isArray(containerIds) || containerIds.length === 0 || !brewerId || !customerLocationId) {
    res.status(400).json({
      error: "containerIds (non-empty array), brewerId, and customerLocationId are required",
    });
    return;
  }

  const [containers, brewer, location] = await Promise.all([
    prisma.container.findMany({
      where: { id: { in: containerIds } },
      include: { containerType: true },
    }),
    prisma.brewer.findUnique({ where: { id: brewerId } }),
    prisma.location.findUnique({ where: { id: customerLocationId } }),
  ]);

  if (containers.length !== containerIds.length) {
    res.status(404).json({ error: "One or more containers not found" });
    return;
  }
  if (!brewer) { res.status(404).json({ error: "Brewer not found" }); return; }
  if (!location) { res.status(404).json({ error: "Customer location not found" }); return; }

  const emptyContainer = containers.find((c) => c.isEmpty);
  if (emptyContainer) {
    res.status(422).json({ error: `Container ${emptyContainer.id} is empty and cannot be sold` });
    return;
  }

  const totalAmount = containers.reduce(
    (sum, c) => sum + c.containerType.externalPrice + c.containerType.depositFee,
    0,
  );

  const result = await prisma.$transaction(async (tx) => {
    const updatedContainers = await Promise.all(
      containers.map((c) =>
        tx.container.update({
          where: { id: c.id },
          data: { locationId: customerLocationId, beerId: null, isEmpty: true, isReserved: false, reservedFor: null },
          include: { containerType: true, beer: true, location: true },
        }),
      ),
    );

    const entry = await tx.accountEntry.create({
      data: {
        brewerId,
        amount: totalAmount,
        type: "sale",
        description: description ?? `Sold ${containers.length} container(s) to ${location.name}`,
      },
    });

    return { containers: updatedContainers, accountEntry: entry };
  });

  res.json(result);
});

// Self-Consume: empty container + debit brewer
actionsRouter.post("/self-consume", async (req: Request, res: Response) => {
  const { containerId, brewerId, description } = req.body;

  if (!containerId || !brewerId) {
    res.status(400).json({ error: "containerId and brewerId are required" });
    return;
  }

  const [container, brewer] = await Promise.all([
    prisma.container.findUnique({
      where: { id: containerId },
      include: { containerType: true, beer: true },
    }),
    prisma.brewer.findUnique({ where: { id: brewerId } }),
  ]);

  if (!container) { res.status(404).json({ error: "Container not found" }); return; }
  if (!brewer) { res.status(404).json({ error: "Brewer not found" }); return; }
  if (container.isEmpty) {
    res.status(422).json({ error: "Container is already empty" });
    return;
  }

  const amount = -container.containerType.internalPrice;
  const beerName = container.beer?.name ?? "unknown beer";

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.container.update({
      where: { id: containerId },
      data: {
        beerId: null,
        isEmpty: true,
        isReserved: false,
        reservedFor: null,
      },
      include: { containerType: true, beer: true, location: true },
    });

    const entry = await tx.accountEntry.create({
      data: {
        brewerId,
        amount,
        type: "self_consumption",
        description: description ?? `Self-consumed ${container.containerType.name} (${beerName})`,
      },
    });

    return { container: updated, accountEntry: entry };
  });

  res.json(result);
});

// Batch-return: move multiple containers back + single combined accounting entry
actionsRouter.post("/batch-return", async (req: Request, res: Response) => {
  const { containerIds, brewerId, returnLocationId, description } = req.body;

  if (!Array.isArray(containerIds) || containerIds.length === 0 || !brewerId || !returnLocationId) {
    res.status(400).json({
      error: "containerIds (non-empty array), brewerId, and returnLocationId are required",
    });
    return;
  }

  const [containers, brewer, location] = await Promise.all([
    prisma.container.findMany({
      where: { id: { in: containerIds } },
      include: { containerType: true },
    }),
    prisma.brewer.findUnique({ where: { id: brewerId } }),
    prisma.location.findUnique({ where: { id: returnLocationId } }),
  ]);

  if (containers.length !== containerIds.length) {
    res.status(404).json({ error: "One or more containers not found" });
    return;
  }
  if (!brewer) { res.status(404).json({ error: "Brewer not found" }); return; }
  if (!location) { res.status(404).json({ error: "Return location not found" }); return; }

  const totalAmount = -containers.reduce((sum, c) => sum + c.containerType.depositFee, 0);

  const result = await prisma.$transaction(async (tx) => {
    const updatedContainers = await Promise.all(
      containers.map((c) =>
        tx.container.update({
          where: { id: c.id },
          data: { locationId: returnLocationId, beerId: null, isEmpty: true, isReserved: false, reservedFor: null },
          include: { containerType: true, beer: true, location: true },
        }),
      ),
    );

    const entry = await tx.accountEntry.create({
      data: {
        brewerId,
        amount: totalAmount,
        type: "container_return",
        description: description ?? `Returned ${containers.length} container(s) to ${location.name}`,
      },
    });

    return { containers: updatedContainers, accountEntry: entry };
  });

  res.json(result);
});

// Container Return: move + empty container + debit brewer deposit
actionsRouter.post("/container-return", async (req: Request, res: Response) => {
  const { containerId, brewerId, returnLocationId, description } = req.body;

  if (!containerId || !brewerId || !returnLocationId) {
    res.status(400).json({
      error: "containerId, brewerId, and returnLocationId are required",
    });
    return;
  }

  const [container, brewer, location] = await Promise.all([
    prisma.container.findUnique({
      where: { id: containerId },
      include: { containerType: true },
    }),
    prisma.brewer.findUnique({ where: { id: brewerId } }),
    prisma.location.findUnique({ where: { id: returnLocationId } }),
  ]);

  if (!container) { res.status(404).json({ error: "Container not found" }); return; }
  if (!brewer) { res.status(404).json({ error: "Brewer not found" }); return; }
  if (!location) { res.status(404).json({ error: "Return location not found" }); return; }

  const amount = -container.containerType.depositFee;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.container.update({
      where: { id: containerId },
      data: {
        locationId: returnLocationId,
        beerId: null,
        isEmpty: true,
        isReserved: false,
        reservedFor: null,
      },
      include: { containerType: true, beer: true, location: true },
    });

    const entry = await tx.accountEntry.create({
      data: {
        brewerId,
        amount,
        type: "container_return",
        description: description ?? `Container returned: ${container.containerType.name}`,
      },
    });

    return { container: updated, accountEntry: entry };
  });

  res.json(result);
});
