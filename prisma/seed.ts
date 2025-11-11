import { PrismaClient } from "@prisma/client";
import chalk from "chalk";

const prisma = new PrismaClient();

// Base coordinates near Linden, MI
const baseLat = 42.78793614509639;
const baseLng = -83.7728352473335;

function randomOffset() {
  // Keep traps and hives within a few hundred feet radius
  return (Math.random() - 0.5) * 0.002;
}

function logSection(title: string) {
  console.log(
    chalk.yellowBright.bold(
      `\n==================== ${title} ====================`
    )
  );
}

function logSuccess(message: string) {
  console.log(chalk.greenBright(`✅ ${message}`));
}

function logInfo(message: string) {
  console.log(chalk.blueBright(`ℹ️  ${message}`));
}

async function main() {
  logSection("Starting Prisma Seed");

  const guestEmail = "guest_demo@next-hive.app";
  const guestClerkId = "user_33sr53Z3M7iNuPJkENWuxdpfwH8";

  // Ensure demo user exists
  let user = await prisma.user.findUnique({ where: { email: guestEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Guest Beekeeper",
        email: guestEmail,
        clerkId: guestClerkId,
      },
    });
    logSuccess("Created demo user: Guest Beekeeper");
  } else {
    logInfo("Demo user already exists");
  }

  const userId = user.id;

  // Clear existing demo data for this user
  logSection("Clearing Old Data");
  await prisma.expense.deleteMany({ where: { userId } });
  await prisma.harvest.deleteMany({ where: { userId } });
  await prisma.inspection.deleteMany({ where: { userId } });
  await prisma.inventory.deleteMany({ where: { userId } });
  await prisma.invoiceItem.deleteMany({ where: { invoice: { userId } } });
  await prisma.invoice.deleteMany({ where: { userId } });
  await prisma.income.deleteMany({ where: { userId } });
  await prisma.hive.deleteMany({ where: { userId } });
  await prisma.swarmTrap.deleteMany({ where: { userId } });
  await prisma.settings.deleteMany({ where: { userId } });
  logSuccess("Existing demo data cleared");

  // ===================== Swarm Traps =====================
  logSection("Creating Swarm Traps");

  const trapNotes = [
    "Near woodline by pond",
    "Behind old barn",
    "Close to field edge",
    "Next to bee yard",
    "In maple grove",
  ];

  const swarmTraps = await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.swarmTrap.create({
        data: {
          label: `Trap #${i + 1}`,
          installedAt: new Date(`2024-${(i % 12) + 1}-10`),
          latitude: baseLat + randomOffset(),
          longitude: baseLng + randomOffset(),
          notes: trapNotes[i % trapNotes.length],
          userId,
        },
      })
    )
  );
  logSuccess(`Created ${swarmTraps.length} swarm traps`);

  // ===================== Hives =====================
  logSection("Creating Hives");

  const queenColors = ["Blue", "White", "Yellow", "Red", "Green"];
  const hives = await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.hive.create({
        data: {
          hiveNumber: 200 + i,
          hiveSource: i % 2 === 0 ? "Captured Swarm" : "Package Bees",
          hiveDate: new Date(`2024-${(i % 12) + 1}-15`),
          broodBoxes: 2,
          superBoxes: 1 + (i % 2),
          queenColor: queenColors[i % queenColors.length],
          hiveStrength: 6 + (i % 3),
          latitude: baseLat + randomOffset(),
          longitude: baseLng + randomOffset(),
          isFromSwarmTrap: i % 3 === 0,
          swarmTrapId:
            i % 3 === 0 ? swarmTraps[i % swarmTraps.length].id : null,
          userId,
        },
      })
    )
  );
  logSuccess(`Created ${hives.length} hives`);

  // ===================== Inspections =====================
  logSection("Creating Inspections");

  const temperaments = ["Calm", "Defensive", "Neutral"];
  await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.inspection.create({
        data: {
          hiveId: hives[i % hives.length].id,
          inspectionDate: new Date(`2025-${(i % 12) + 1}-05`),
          temperament: temperaments[i % temperaments.length],
          hiveStrength: 5 + (i % 5),
          brood: i % 2 === 0,
          queen: true,
          userId,
        },
      })
    )
  );
  logSuccess("Created 20 inspections");

  // ===================== Harvests =====================
  logSection("Creating Honey Harvests");

  // Generate 5 years of data — two harvests per year (summer + fall)
  const harvests = [];
  const endYear = 2025;
  const startYear = endYear - 4; // 5 years total

  for (let year = startYear; year <= endYear; year++) {
    // Summer harvest (July)
    harvests.push({
      harvestType: "Honey",
      harvestAmount: parseFloat((Math.random() * 50 + 40).toFixed(1)), // 40–90 lbs
      harvestDate: new Date(`${year}-07-15`),
      // Removed 'notes' field - not in Harvest schema
      userId,
    });

    // Fall harvest (September)
    harvests.push({
      harvestType: "Honey",
      harvestAmount: parseFloat((Math.random() * 60 + 30).toFixed(1)), // 30–90 lbs
      harvestDate: new Date(`${year}-09-20`),
      // Removed 'notes' field - not in Harvest schema
      userId,
    });
  }

  await prisma.harvest.createMany({ data: harvests });
  logSuccess(
    `Created ${harvests.length} honey harvests (2 per year, ${startYear}–${endYear})`
  );

  // ===================== Invoices + Income =====================
  logSection("Creating Invoices and Income");

  const customers = [
    { name: "John Smith", email: "john@example.com", phone: "5551234567" },
    { name: "Sarah Johnson", email: "sarah@example.com", phone: "5552345678" },
    { name: "Mike Brown", email: "mike@example.com", phone: "5553456789" },
    { name: "Emily Davis", email: "emily@example.com", phone: "5554567890" },
  ];

  const products = [
    { name: "Honey Jar", price: 10 },
    { name: "Candle", price: 15 },
    { name: "Wax Block", price: 25 },
    { name: "Gift Box", price: 40 },
  ];

  const invoicesPerYear = 12;
  let totalInvoices = 0;

  for (let year = startYear; year <= endYear; year++) {
    for (let i = 0; i < invoicesPerYear; i++) {
      const customer = customers[(i + year) % customers.length];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = Array.from({ length: numItems }).map(() => {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;
        return {
          product: product.name,
          quantity,
          unitPrice: product.price,
        };
      });

      const total = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );

      const date = new Date(`${year}-${(i % 12) + 1}-10`);

      const invoice = await prisma.invoice.create({
        data: {
          customerName: customer.name,
          email: customer.email,
          phone: customer.phone,
          date,
          total,
          notes: `Demo Invoice ${year}-${i + 1}`,
          userId,
          items: { create: items },
        },
      });

      await prisma.income.create({
        data: {
          source: `Invoice - ${customer.name}`,
          amount: total,
          date,
          notes: `Income from ${customer.name} (${year})`,
          invoiceId: invoice.id,
          userId,
        },
      });

      totalInvoices++;
    }
  }

  logSuccess(
    `Created ${totalInvoices} invoices and linked incomes (~$20k/year)`
  );

  // ===================== Expenses =====================
  logSection("Creating Expenses");

  const categories = ["Equipment", "Supplies", "Travel", "Maintenance", "Feed"];
  const expenses = [];

  for (let year = startYear; year <= endYear; year++) {
    for (let i = 0; i < 8; i++) {
      expenses.push({
        item: categories[i % categories.length],
        amount: parseFloat((Math.random() * 500 + 100).toFixed(2)),
        date: new Date(`${year}-${(i % 12) + 1}-05`),
        notes: `Operational expense ${year}`,
        userId,
      });
    }
  }

  await prisma.expense.createMany({ data: expenses });
  logSuccess(`Created ${expenses.length} expenses`);

  // ===================== Inventory =====================
  logSection("Creating Inventory");

  const inventoryItems = [
    "Jars",
    "Frames",
    "Bee Suit",
    "Smoker",
    "Hive Tool",
    "Extractor",
    "Feeder",
    "Brush",
    "Gloves",
    "Super Boxes",
  ];
  const locations = ["Garage", "Workshop", "Storage Shed", "Truck"];

  await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.inventory.create({
        data: {
          name: inventoryItems[i % inventoryItems.length],
          location: locations[i % locations.length],
          quantity: Math.floor(Math.random() * 20) + 1,
          userId,
        },
      })
    )
  );
  logSuccess("Created 20 inventory items");

  // ===================== Settings =====================
  logSection("Creating Settings");

  await prisma.settings.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      hiveAddress: "123 Demo Apiary Rd, Linden, MI",
      darkMode: false,
    },
  });
  logSuccess("Created settings for demo user");

  logSection("🎉 Demo Seed Complete!");
  console.log(chalk.green.bold("\nAll demo data successfully seeded.\n"));
}

main()
  .catch((err) => {
    console.error(chalk.redBright("❌ Seed failed:"), err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log(chalk.gray("Database connection closed."));
  });
