import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const accountingRouter = Router();

// Get all balances (net balance per brewer)
accountingRouter.get("/balances", async (_req: Request, res: Response) => {
  const entries = await prisma.accountEntry.groupBy({
    by: ["brewerId"],
    _sum: { amount: true },
  });

  const brewers = await prisma.brewer.findMany({ orderBy: { name: "asc" } });

  const balances = brewers.map((brewer) => {
    const entry = entries.find((e) => e.brewerId === brewer.id);
    return {
      brewerId: brewer.id,
      brewerName: brewer.name,
      balance: entry?._sum.amount ?? 0,
    };
  });

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
      include: { brewer: true },
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
  const { brewerId, amount, type, description } = req.body;

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

  const entry = await prisma.accountEntry.create({
    data: {
      brewerId,
      amount,
      type: type || "manual",
      description: description?.trim() || null,
    },
    include: { brewer: true },
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
  const brewerMap = new Map(brewers.map((b) => [b.id, b.name]));

  // Calculate net balances
  const balances: { id: string; name: string; balance: number }[] = brewers.map((b) => ({
    id: b.id,
    name: b.name,
    balance: entries.find((e) => e.brewerId === b.id)?._sum.amount ?? 0,
  }));

  // Netting algorithm: simplify debts
  const settlements = calculateSettlements(balances);

  res.json(settlements);
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

  // Separate debtors (negative balance) and creditors (positive balance)
  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ ...b, balance: Math.abs(b.balance) }))
    .sort((a, b) => b.balance - a.balance);

  const creditors = balances
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  let di = 0;
  let ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const debtor = debtors[di]!;
    const creditor = creditors[ci]!;
    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0.01) {
      settlements.push({
        from: { id: debtor.id, name: debtor.name },
        to: { id: creditor.id, name: creditor.name },
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance < 0.01) di++;
    if (creditor.balance < 0.01) ci++;
  }

  return settlements;
}
