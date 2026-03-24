import Database from "better-sqlite3";
import { prisma } from "./prisma";

/**
 * Fetches all data from PostgreSQL via Prisma and writes it into an
 * in-memory SQLite database. Returns the database as a Buffer.
 */
export async function buildSqliteBackup(): Promise<Buffer> {
  const [brewers, beers, locations, containerTypes, containers, categories, accountEntries] =
    await Promise.all([
      prisma.brewer.findMany(),
      prisma.beer.findMany(),
      prisma.location.findMany(),
      prisma.containerType.findMany(),
      prisma.container.findMany(),
      prisma.category.findMany(),
      prisma.accountEntry.findMany(),
    ]);

  const db = new Database(":memory:");
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE brewer (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE beer (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      style TEXT,
      batchId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE location (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      brewerId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE container_type (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      externalPrice REAL NOT NULL,
      internalPrice REAL NOT NULL,
      depositFee REAL NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE container (
      id TEXT PRIMARY KEY,
      containerTypeId TEXT NOT NULL,
      beerId TEXT,
      locationId TEXT NOT NULL,
      isEmpty INTEGER NOT NULL,
      isReserved INTEGER NOT NULL,
      reservedFor TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE category (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE account_entry (
      id TEXT PRIMARY KEY,
      brewerId TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      categoryId TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  const insertBrewer = db.prepare(
    "INSERT INTO brewer VALUES (@id, @name, @createdAt, @updatedAt)",
  );
  const insertBeer = db.prepare(
    "INSERT INTO beer VALUES (@id, @name, @style, @batchId, @createdAt, @updatedAt)",
  );
  const insertLocation = db.prepare(
    "INSERT INTO location VALUES (@id, @name, @type, @brewerId, @createdAt, @updatedAt)",
  );
  const insertContainerType = db.prepare(
    "INSERT INTO container_type VALUES (@id, @name, @icon, @externalPrice, @internalPrice, @depositFee, @createdAt, @updatedAt)",
  );
  const insertContainer = db.prepare(
    "INSERT INTO container VALUES (@id, @containerTypeId, @beerId, @locationId, @isEmpty, @isReserved, @reservedFor, @createdAt, @updatedAt)",
  );
  const insertCategory = db.prepare(
    "INSERT INTO category VALUES (@id, @name, @type, @createdAt, @updatedAt)",
  );
  const insertAccountEntry = db.prepare(
    "INSERT INTO account_entry VALUES (@id, @brewerId, @amount, @type, @description, @categoryId, @createdAt)",
  );

  const toIso = (d: Date) => d.toISOString();

  const insertAll = db.transaction(() => {
    for (const r of brewers)
      insertBrewer.run({ ...r, createdAt: toIso(r.createdAt), updatedAt: toIso(r.updatedAt) });
    for (const r of beers)
      insertBeer.run({ ...r, createdAt: toIso(r.createdAt), updatedAt: toIso(r.updatedAt) });
    for (const r of locations)
      insertLocation.run({ ...r, createdAt: toIso(r.createdAt), updatedAt: toIso(r.updatedAt) });
    for (const r of containerTypes)
      insertContainerType.run({
        ...r,
        createdAt: toIso(r.createdAt),
        updatedAt: toIso(r.updatedAt),
      });
    for (const r of containers)
      insertContainer.run({
        ...r,
        isEmpty: r.isEmpty ? 1 : 0,
        isReserved: r.isReserved ? 1 : 0,
        createdAt: toIso(r.createdAt),
        updatedAt: toIso(r.updatedAt),
      });
    for (const r of categories)
      insertCategory.run({ ...r, createdAt: toIso(r.createdAt), updatedAt: toIso(r.updatedAt) });
    for (const r of accountEntries)
      insertAccountEntry.run({
        ...r,
        createdAt: toIso(r.createdAt),
      });
  });

  insertAll();

  const buffer = db.serialize() as Buffer;
  db.close();
  return buffer;
}

/**
 * Reads a SQLite backup buffer and restores all data into PostgreSQL.
 * Runs inside a single Prisma transaction — all-or-nothing.
 */
export async function restoreFromSqliteBackup(buffer: Buffer): Promise<void> {
  const db = new Database(buffer);

  const brewers = db.prepare("SELECT * FROM brewer").all() as {
    id: string; name: string; createdAt: string; updatedAt: string;
  }[];
  const beers = db.prepare("SELECT * FROM beer").all() as {
    id: string; name: string; style: string | null; batchId: string | null;
    createdAt: string; updatedAt: string;
  }[];
  const locations = db.prepare("SELECT * FROM location").all() as {
    id: string; name: string; type: string; brewerId: string | null;
    createdAt: string; updatedAt: string;
  }[];
  const containerTypes = db.prepare("SELECT * FROM container_type").all() as {
    id: string; name: string; icon: string | null; externalPrice: number;
    internalPrice: number; depositFee: number; createdAt: string; updatedAt: string;
  }[];
  const containers = db.prepare("SELECT * FROM container").all() as {
    id: string; containerTypeId: string; beerId: string | null; locationId: string;
    isEmpty: number; isReserved: number; reservedFor: string | null;
    createdAt: string; updatedAt: string;
  }[];
  const categories = db.prepare("SELECT * FROM category").all() as {
    id: string; name: string; type: string; createdAt: string; updatedAt: string;
  }[];
  const accountEntries = db.prepare("SELECT * FROM account_entry").all() as {
    id: string; brewerId: string; amount: number; type: string; description: string | null;
    categoryId: string | null; createdAt: string;
  }[];

  db.close();

  await prisma.$transaction(async (tx) => {
    // Delete in reverse dependency order
    await tx.accountEntry.deleteMany();
    await tx.container.deleteMany();
    await tx.containerType.deleteMany();
    await tx.beer.deleteMany();
    await tx.location.deleteMany();
    await tx.brewer.deleteMany();
    await tx.category.deleteMany();

    // Re-insert in dependency order
    if (brewers.length > 0)
      await tx.brewer.createMany({
        data: brewers.map((r) => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) })),
      });
    if (beers.length > 0)
      await tx.beer.createMany({
        data: beers.map((r) => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) })),
      });
    if (locations.length > 0)
      await tx.location.createMany({
        data: locations.map((r) => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) })),
      });
    if (containerTypes.length > 0)
      await tx.containerType.createMany({
        data: containerTypes.map((r) => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) })),
      });
    if (containers.length > 0)
      await tx.container.createMany({
        data: containers.map((r) => ({
          ...r,
          isEmpty: r.isEmpty === 1,
          isReserved: r.isReserved === 1,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        })),
      });
    if (categories.length > 0)
      await tx.category.createMany({
        data: categories.map((r) => ({ ...r, createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) })),
      });
    if (accountEntries.length > 0)
      await tx.accountEntry.createMany({
        data: accountEntries.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt),
        })),
      });
  });
}
