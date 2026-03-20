import { Request } from "express";

/** Safely extract a single route param as string */
export function getParam(req: Request, name: string): string {
  const val = req.params[name];
  if (Array.isArray(val)) return val[0] ?? "";
  return val ?? "";
}
