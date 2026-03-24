import { createClient } from "webdav";
import cron from "node-cron";
import { buildSqliteBackup } from "./sqliteExport";

function startWebDavBackupSchedule(): void {
  const webdavUrl = process.env.WEBDAV_URL;
  const webdavUser = process.env.WEBDAV_USER;
  const webdavPass = process.env.WEBDAV_PASS;

  if (!webdavUrl) return;

  const client = createClient(webdavUrl, {
    username: webdavUser,
    password: webdavPass,
  });

  // Daily at 02:00
  cron.schedule("0 2 * * *", async () => {
    try {
      const buffer = await buildSqliteBackup();
      const filename = `hopledger-backup-${new Date().toISOString().slice(0, 10)}.sqlite`;
      await client.putFileContents(filename, buffer, { overwrite: true });
      console.log(`[backup] WebDAV backup written: ${filename}`);
    } catch (err) {
      console.error("[backup] WebDAV backup failed:", err);
    }
  });

  console.log(`[backup] Daily WebDAV backup scheduled → ${webdavUrl}`);
}

export { startWebDavBackupSchedule };
