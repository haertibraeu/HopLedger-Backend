import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const publicRouter = Router();

// Public inventory: available, non-reserved, filled containers grouped by beer
publicRouter.get("/inventory", async (_req: Request, res: Response) => {
  const showLocations = process.env["SHOW_LOCATIONS"] !== "false";

  const containers = await prisma.container.findMany({
    where: {
      isEmpty: false,
      isReserved: false,
      location: {
        type: { in: ["brewery", "brewer"] },
      },
    },
    include: {
      beer: true,
      containerType: true,
      location: true,
    },
  });

  // Group by beer → container type (→ location if shown)
  const beerMap = new Map<
    string,
    { name: string; containers: Map<string, { type: string; count: number; location: string }> }
  >();

  for (const c of containers) {
    const beerName = c.beer?.name ?? "Unknown";
    if (!beerMap.has(beerName)) {
      beerMap.set(beerName, { name: beerName, containers: new Map() });
    }
    const beer = beerMap.get(beerName)!;

    const groupKey = showLocations
      ? `${c.containerType.name}||${c.location.name}`
      : c.containerType.name;

    const existing = beer.containers.get(groupKey);
    if (existing) {
      existing.count++;
    } else {
      beer.containers.set(groupKey, {
        type: c.containerType.name,
        count: 1,
        location: c.location.name,
      });
    }
  }

  const beers = Array.from(beerMap.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((beer) => ({
      name: beer.name,
      containers: Array.from(beer.containers.values())
        .sort((a, b) => a.type.localeCompare(b.type))
        .map((c) => {
          const entry: Record<string, unknown> = {
            type: c.type,
            count: c.count,
          };
          if (showLocations) entry["location"] = c.location;
          return entry;
        }),
    }));

  res.json({
    last_updated: new Date().toISOString(),
    show_locations: showLocations,
    beers,
  });
});
