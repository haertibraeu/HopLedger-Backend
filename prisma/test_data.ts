import { prisma } from "../src/utils/prisma";

async function main() {
  console.log("Starting seeding test data...");

  // 1. Clean up existing data
  console.log("Cleaning up existing data...");
  await prisma.accountEntry.deleteMany();
  await prisma.container.deleteMany();
  await prisma.containerType.deleteMany();
  await prisma.beer.deleteMany();
  await prisma.location.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brewer.deleteMany();

  // 2. Brewers
  console.log("Seeding brewers...");
  const brewerFritz = await prisma.brewer.create({
    data: { name: "Fritz" }
  });
  const brewerHans = await prisma.brewer.create({
    data: { name: "Hans" }
  });

  // 3. Categories
  console.log("Seeding categories...");
  const categorySales = await prisma.category.create({
    data: { name: "Beer Sales", type: "income" }
  });
  const categoryEvent = await prisma.category.create({
    data: { name: "Event Income", type: "income" }
  });
  const categoryIngredients = await prisma.category.create({
    data: { name: "Ingredients", type: "expense" }
  });
  const categoryPackaging = await prisma.category.create({
    data: { name: "Packaging", type: "expense" }
  });
  const categoryUtilities = await prisma.category.create({
    data: { name: "Rent & Utilities", type: "expense" }
  });

  // 4. Locations
  console.log("Seeding locations...");
  const locMain = await prisma.location.create({
    data: { name: "Main Brewery", type: "brewery" }
  });
  const locFritz = await prisma.location.create({
    data: { name: "Fritz Home", type: "brewer" }
  });
  const locHans = await prisma.location.create({
    data: { name: "Hans Home", type: "brewer" }
  });

  // 5. Container Types
  console.log("Seeding container types...");
  const ctBottle = await prisma.containerType.create({
    data: {
      name: "0.5l Glass Bottle",
      externalPrice: 3.5,
      internalPrice: 1.5,
      depositFee: 0.5
    }
  });
  const ctKeg = await prisma.containerType.create({
    data: {
      name: "20l Stainless Keg",
      externalPrice: 85.0,
      internalPrice: 40.0,
      depositFee: 30.0
    }
  });

  // 6. Beers
  console.log("Seeding beers...");
  const beerPaleAle = await prisma.beer.create({
    data: { name: "HopLedger Pale Ale", style: "APA" }
  });
  const beerStout = await prisma.beer.create({
    data: { name: "Dark Side Stout", style: "Stout" }
  });

  // 7. Containers
  console.log("Seeding containers...");
  // 10 full bottles in brewery
  for (let i = 0; i < 10; i++) {
    await prisma.container.create({
      data: {
        containerTypeId: ctBottle.id,
        beerId: beerPaleAle.id,
        locationId: locMain.id,
        isEmpty: false
      }
    });
  }

  // 5 full bottles in Hans Home
  for (let i = 0; i < 5; i++) {
    await prisma.container.create({
      data: {
        containerTypeId: ctBottle.id,
        beerId: beerStout.id,
        locationId: locHans.id,
        isEmpty: false
      }
    });
  }

  // 2 full kegs in brewery
  await prisma.container.create({
    data: {
      containerTypeId: ctKeg.id,
      beerId: beerStout.id,
      locationId: locMain.id,
      isEmpty: false
    }
  });
  await prisma.container.create({
    data: {
      containerTypeId: ctKeg.id,
      beerId: beerPaleAle.id,
      locationId: locMain.id,
      isEmpty: false
    }
  });

  // 8. Account Entries
  console.log("Seeding account entries...");
  await prisma.accountEntry.create({
    data: {
      brewerId: brewerFritz.id,
      amount: 170.0,
      type: "sale",
      description: "Sold 2 kegs to The Hops",
      categoryId: categorySales.id
    }
  });

  await prisma.accountEntry.create({
    data: {
      brewerId: brewerFritz.id,
      amount: -45.50,
      type: "manual",
      description: "Purchased 20kg Malt",
      categoryId: categoryIngredients.id
    }
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
