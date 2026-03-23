import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { getParam } from "../utils/params";

export const categoriesRouter = Router();

// List all categories
categoriesRouter.get("/", async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

// Get single category
categoriesRouter.get("/:id", async (req: Request, res: Response) => {
  const category = await prisma.category.findUnique({
    where: { id: getParam(req, "id") },
  });
  if (!category) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json(category);
});

// Create category
categoriesRouter.post("/", async (req: Request, res: Response) => {
  const { name, type } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  const categoryType = type === "expense" ? "expense" : "income";
  const category = await prisma.category.create({
    data: { name: name.trim(), type: categoryType },
  });
  res.status(201).json(category);
});

// Update category
categoriesRouter.put("/:id", async (req: Request, res: Response) => {
  const { name, type } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Name is required" });
    return;
  }
  try {
    const updateData: { name: string; type?: string } = { name: name.trim() };
    if (type === "income" || type === "expense") updateData.type = type;
    const category = await prisma.category.update({
      where: { id: getParam(req, "id") },
      data: updateData,
    });
    res.json(category);
  } catch {
    res.status(404).json({ error: "Category not found" });
  }
});

// Delete category
categoriesRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    // Set categoryId to null on associated entries before deleting
    await prisma.accountEntry.updateMany({
      where: { categoryId: getParam(req, "id") },
      data: { categoryId: null },
    });
    await prisma.category.delete({
      where: { id: getParam(req, "id") },
    });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Category not found" });
  }
});
