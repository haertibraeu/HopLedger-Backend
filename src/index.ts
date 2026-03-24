import { createApp } from "./app";
import { prisma } from "./utils/prisma";
import { startWebDavBackupSchedule } from "./utils/webdavPush";

const PORT = process.env["PORT"] || 3000;

async function main() {
  // Verify database connection
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }

  startWebDavBackupSchedule();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`🍺 HopLedger Backend running on port ${PORT}`);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
