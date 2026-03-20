import { Request, Response, NextFunction } from "express";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  // Public endpoints bypass auth
  if (req.path.startsWith("/public/")) {
    next();
    return;
  }

  const apiKey = req.headers["x-api-key"];
  const validKey = process.env["API_KEY"];

  if (!validKey) {
    // If no API key is configured, allow all requests (dev mode)
    next();
    return;
  }

  if (!apiKey || apiKey !== validKey) {
    res.status(401).json({ error: "Invalid or missing API key" });
    return;
  }

  next();
}
