-- Add type field to categories table
-- "income" for revenue categories, "expense" for cost categories
ALTER TABLE "categories" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'income';
