import { prisma } from "../src/utils/prisma";

const DEFAULT_CATEGORIES = [
  "Material Brauerei",
  "Zutaten",
  "Gas, Strom & Wasser",
];

async function main() {
  console.log("Seeding categories...");

  for (const name of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (!existing) {
      await prisma.category.create({ data: { name } });
      console.log(`  Created category: ${name}`);
    } else {
      console.log(`  Category already exists: ${name}`);
    }
  }

  console.log("Done seeding.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
