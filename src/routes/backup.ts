import { Router, Request, Response } from "express";
import multer from "multer";
import { buildSqliteBackup, restoreFromSqliteBackup } from "../utils/sqliteExport";

export const backupRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (_req, file, cb) => {
    if (file.originalname.endsWith(".sqlite") || file.mimetype === "application/octet-stream") {
      cb(null, true);
    } else {
      cb(new Error("Only .sqlite files are accepted"));
    }
  },
});

// GET /api/backup/export — exports the full database as a SQLite file
backupRouter.get("/export", async (_req: Request, res: Response) => {
  try {
    const buffer = await buildSqliteBackup();
    const filename = `hopledger-backup-${new Date().toISOString().slice(0, 10)}.sqlite`;
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error("[backup] Export failed:", err);
    res.status(500).json({ error: "Export failed" });
  }
});

// POST /api/backup/import — restores the database from an uploaded SQLite file
backupRouter.post("/import", upload.single("backup"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No backup file provided (field name: backup)" });
    return;
  }

  try {
    await restoreFromSqliteBackup(req.file.buffer);
    res.json({ message: "Database restored successfully" });
  } catch (err) {
    console.error("[backup] Import failed:", err);
    res.status(500).json({ error: "Import failed" });
  }
});
