import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const baseLat = 42.78793614509639;
const baseLng = -83.7728352473335;

function randomOffset() {
  // ~within 0.001 lat/lng degrees (a few hundred feet)
  return (Math.random() - 0.5) * 0.002;
}

async function main() {
  const clerkId = "user_33R1nUHO96g8kFoXIMHeak7dVQn";
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error(`❌ No user found with clerkId ${clerkId}`);
  const userId = user.id;

  // 🔥 Clear old data (in reverse dependency order)
  await prisma.expense.deleteMany();
  await prisma.harvest.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.income.deleteMany();
  await prisma.hive.deleteMany();
  await prisma.swarmTrap.deleteMany();
  await prisma.settings.deleteMany();

  console.log("🗑️ Cleared existing data");

  // ===============================
  // Hives
  // ===============================
  const queenColors = ["Blue", "White", "Yellow", "Red", "Green"];
  const hives = await Promise.all(
    Array.from({ length: 20 }).map((_, i) =>
      prisma.hive.create({
        data: {
          hiveNumber: 100 + i,
          hiveSource: i % 2 === 0 ? "Captured Swarm" : "Nuc Purchase",
          hiveDate: new Date(`2025-06-${(i % 28) + 1}`),
          broodBoxes: 2,
          superBoxes: i % 2 === 0 ? 1 : 2,
          queenColor: queenColors[i % queenColors.length],
          queenExcluder: "Yes",
          hiveStrength: 6 + (i % 10),
          latitude: baseLat + randomOffset(),
          longitude: baseLng + randomOffset(),
          isFromSwarmTrap: i % 2 === 0,
          userId,
        },
      })
    )
  );

  console.log(`✅ Created ${hives.length} hives`);

  // ===============================
  // Invoices + Incomes
  // ===============================
  const customers = [
    { name: "John Smith", email: "john@example.com", phone: "5551234567" },
    { name: "Sarah Johnson", email: "sarah@example.com", phone: "5552345678" },
    { name: "Mike Brown", email: "mike@example.com", phone: "5553456789" },
    { name: "Emily Davis", email: "emily@example.com", phone: "5554567890" },
    { name: "David Wilson", email: "david@example.com", phone: "5555678901" },
  ];

  const products = [
    { name: "honey", price: 8 },
    { name: "honey bulk", price: 30 },
    { name: "candles small", price: 5 },
    { name: "candles med", price: 10 },
    { name: "candles lg", price: 15 },
    { name: "honey bundle", price: 20 },
  ];

  for (let i = 0; i < 10; i++) {
    const customer = customers[i % customers.length];
    const numItems = Math.floor(Math.random() * 3) + 1;
    let total = 0;
    const items = [];

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemTotal = product.price * quantity;
      total += itemTotal;

      items.push({
        product: product.name,
        quantity,
        unitPrice: product.price,
      });
    }

    const invoiceDate = new Date(`2025-0${(i % 9) + 1}-${(i % 28) + 1}`);

    const invoice = await prisma.invoice.create({
      data: {
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        date: invoiceDate,
        total,
        notes: `Invoice #${i + 1} for ${customer.name}`,
        userId,
        items: {
          create: items,
        },
      },
    });

    await prisma.income.create({
      data: {
        source: `Invoice - ${customer.name}`,
        amount: total,
        date: invoiceDate,
        notes: `Auto-generated from invoice #${invoice.id}`,
        invoiceId: invoice.id,
        userId,
      },
    });

    console.log(`✅ Created invoice #${invoice.id} with linked income`);
  }

  // Standalone Incomes
  const standaloneSources = [
    "Farmers Market Sale",
    "Direct Sale - Cash",
    "Online Store",
    "Wholesale Order",
    "Event Sale",
  ];

  for (let i = 0; i < standaloneSources.length; i++) {
    await prisma.income.create({
      data: {
        source: standaloneSources[i],
        amount: Math.floor(Math.random() * 200) + 50,
        date: new Date(`2025-0${(i % 9) + 1}-${15 + i}`),
        notes: "Standalone income record",
        userId,
      },
    });
  }

  console.log("✅ Seeded standalone incomes");

  // ===============================
  // Expenses
  // ===============================
  const expenseCategories = ["Equipment", "Tools", "Supplies", "Travel"];
  for (let i = 0; i < 5; i++) {
    await prisma.expense.create({
      data: {
        item: expenseCategories[i % expenseCategories.length],
        amount: (Math.random() * 200 + 20).toFixed(2),
        date: new Date(`2025-0${(i % 9) + 1}-${10 + i}`),
        notes: "Sample expense",
        userId,
      },
    });
  }
  console.log("✅ Seeded Expenses");

  // ===============================
  // Harvests
  // ===============================
  for (let i = 0; i < 10; i++) {
    await prisma.harvest.create({
      data: {
        harvestType: i % 2 === 0 ? "Honey" : "Wax",
        harvestAmount: Math.random() * 50 + 10,
        harvestDate: new Date(`2025-07-${(i % 28) + 1}`),
        userId,
      },
    });
  }
  console.log("✅ Seeded Harvests");

  // ===============================
  // Inventory
  // ===============================
  const inventoryItems = [
    { name: "Jars", location: "Storage Shed" },
    { name: "Frames", location: "Workshop" },
    { name: "Bee Suit", location: "Garage" },
    { name: "Smoker", location: "Truck" },
  ];
  for (let i = 0; i < inventoryItems.length; i++) {
    await prisma.inventory.create({
      data: {
        name: inventoryItems[i].name,
        location: inventoryItems[i].location,
        quantity: Math.floor(Math.random() * 20) + 1,
        userId,
      },
    });
  }
  console.log("✅ Seeded Inventory");

  // ===============================
  // Swarm Traps
  // ===============================
  const traps = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.swarmTrap.create({
        data: {
          label: `Trap ${i + 1}`,
          installedAt: new Date(`2025-05-${(i % 28) + 1}`),
          latitude: baseLat + randomOffset(),
          longitude: baseLng + randomOffset(),
          notes: i % 2 === 0 ? "In tree line" : "Near field edge",
          userId,
        },
      })
    )
  );
  console.log("✅ Seeded Swarm Traps");

  // ===============================
  // Inspections (link to first Hive)
  // ===============================
  if (hives[0]) {
    for (let i = 0; i < 5; i++) {
      await prisma.inspection.create({
        data: {
          hiveId: hives[0].id,
          inspectionDate: new Date(`2025-08-${(i % 28) + 1}`),
          temperament: i % 2 === 0 ? "Calm" : "Defensive",
          hiveStrength: 5 + (i % 5),
          brood: i % 2 === 0,
          queen: true,
          userId,
        },
      });
    }
    console.log("✅ Seeded Inspections");
  }

  // ===============================
  // Settings (1:1 with user)
  // ===============================
  await prisma.settings.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      hiveAddress: "123 Bee Farm Rd, Linden, MI",
      darkMode: true,
    },
  });
  console.log("✅ Seeded Settings");

  console.log("🎉 Full seed complete!");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
