import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getParam } from "../utils/params";

export const accountingRouter = Router();

// Get all balances (relative balance per brewer — split-the-bills style)
accountingRouter.get("/balances", async (_req: Request, res: Response) => {
  const entries = await prisma.accountEntry.groupBy({
    by: ["brewerId"],
    _sum: { amount: true },
  });

  const brewers = await prisma.brewer.findMany({ orderBy: { name: "asc" } });

  if (brewers.length === 0) {
    res.json([]);
    return;
  }

  // Compute absolute balances
  const absoluteBalances = brewers.map((brewer) => {
    const entry = entries.find((e) => e.brewerId === brewer.id);
    return entry?._sum.amount ?? 0;
  });

  // Compute average across all brewers for the split-the-bills model
  const total = absoluteBalances.reduce((sum, b) => sum + b, 0);
  const average = total / brewers.length;

  // Return relative balance: how much above/below the group average each brewer is
  const balances = brewers.map((brewer, i) => ({
    brewerId: brewer.id,
    brewerName: brewer.name,
    balance: Math.round((absoluteBalances[i]! - average) * 100) / 100,
  }));

  res.json(balances);
});

// Get all entries (with optional brewer filter)
accountingRouter.get("/entries", async (req: Request, res: Response) => {
  const { brewerId, page, limit } = req.query;

  const where: Record<string, unknown> = {};
  if (brewerId && typeof brewerId === "string") where["brewerId"] = brewerId;

  const take = Math.min(Number(limit) || 50, 100);
  const skip = ((Number(page) || 1) - 1) * take;

  const [entries, total] = await Promise.all([
    prisma.accountEntry.findMany({
      where,
      include: { brewer: true, category: true },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.accountEntry.count({ where }),
  ]);

  res.json({
    entries,
    pagination: {
      page: Math.floor(skip / take) + 1,
      limit: take,
      total,
      pages: Math.ceil(total / take),
    },
  });
});

// Create a manual accounting entry
accountingRouter.post("/entries", async (req: Request, res: Response) => {
  const { brewerId, amount, type, description, categoryId } = req.body;

  if (!brewerId) {
    res.status(400).json({ error: "brewerId is required" });
    return;
  }
  if (amount === undefined || typeof amount !== "number" || amount === 0) {
    res.status(400).json({ error: "amount must be a non-zero number" });
    return;
  }

  // Verify brewer exists
  const brewer = await prisma.brewer.findUnique({ where: { id: brewerId } });
  if (!brewer) {
    res.status(404).json({ error: "Brewer not found" });
    return;
  }

  // Verify category exists if provided
  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
  }

  const entry = await prisma.accountEntry.create({
    data: {
      brewerId,
      amount,
      type: type || "manual",
      description: description?.trim() || null,
      categoryId: categoryId || null,
    },
    include: { brewer: true, category: true },
  });

  res.status(201).json(entry);
});

// Get settlement suggestions (who owes whom to break even)
accountingRouter.get("/settlements", async (_req: Request, res: Response) => {
  const entries = await prisma.accountEntry.groupBy({
    by: ["brewerId"],
    _sum: { amount: true },
  });

  const brewers = await prisma.brewer.findMany();

  if (brewers.length === 0) {
    res.json([]);
    return;
  }

  // Calculate absolute balances
  const absoluteBalances = brewers.map((b) => ({
    id: b.id,
    name: b.name,
    absolute: entries.find((e) => e.brewerId === b.id)?._sum.amount ?? 0,
  }));

  // Convert to relative balances (split-the-bills: deviation from average)
  const total = absoluteBalances.reduce((sum, b) => sum + b.absolute, 0);
  const average = total / brewers.length;

  const relativeBalances: BrewerBalance[] = absoluteBalances.map((b) => ({
    id: b.id,
    name: b.name,
    balance: Math.round((b.absolute - average) * 100) / 100,
  }));

  // Netting algorithm: simplify debts
  const settlements = calculateSettlements(relativeBalances);

  res.json(settlements);
});

// Delete an accounting entry
accountingRouter.delete("/entries/:id", async (req: Request, res: Response) => {
  const id = getParam(req, "id");
  try {
    await prisma.accountEntry.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Entry not found" });
  }
});

interface BrewerBalance {
  id: string;
  name: string;
  balance: number;
}

interface Settlement {
  from: { id: string; name: string };
  to: { id: string; name: string };
  amount: number;
}

function calculateSettlements(balances: BrewerBalance[]): Settlement[] {
  const settlements: Settlement[] = [];

  // Positive balance = holds more cash than fair share → must pay out to the group.
  // Negative balance = holds less cash than fair share → will receive from the group.
  const payers = balances
    .filter((b) => b.balance > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balance - a.balance);

  const receivers = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ ...b, balance: Math.abs(b.balance) }))
    .sort((a, b) => b.balance - a.balance);

  let pi = 0;
  let ri = 0;

  while (pi < payers.length && ri < receivers.length) {
    const payer = payers[pi]!;
    const receiver = receivers[ri]!;
    const amount = Math.min(payer.balance, receiver.balance);

    if (amount > 0.01) {
      settlements.push({
        from: { id: payer.id, name: payer.name },
        to: { id: receiver.id, name: receiver.name },
        amount: Math.round(amount * 100) / 100,
      });
    }

    payer.balance -= amount;
    receiver.balance -= amount;

    if (payer.balance < 0.01) pi++;
    if (receiver.balance < 0.01) ri++;
  }

  return settlements;
}
