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

  // 🔥 Clear out old data first
  await prisma.hive.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.income.deleteMany({});
  console.log("🗑️ Old hive, invoice, and income data deleted");

  // Queen colors (official 5-year cycle)
  const queenColors = ["Blue", "White", "Yellow", "Red", "Green"];

  // Create 50 hives evenly spread across queen colors
  await Promise.all(
    Array.from({ length: 50 }).map((_, i) =>
      prisma.hive.create({
        data: {
          hiveNumber: 100 + i,
          hiveSource: i % 2 === 0 ? "Captured Swarm" : "Nuc Purchase",
          hiveDate: new Date(`2025-06-${(i % 28) + 1}`),
          broodBoxes: 2,
          superBoxes: i % 2 === 0 ? 1 : 2,
          queenColor: queenColors[i % queenColors.length], // ✅ rotate all 5 colors
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

  console.log("✅ Seed complete: 50 hives created with all queen colors.");

  // Customer names for invoices
  const customers = [
    { name: "John Smith", email: "john@example.com", phone: "5551234567" },
    { name: "Sarah Johnson", email: "sarah@example.com", phone: "5552345678" },
    { name: "Mike Brown", email: "mike@example.com", phone: "5553456789" },
    { name: "Emily Davis", email: "emily@example.com", phone: "5554567890" },
    { name: "David Wilson", email: "david@example.com", phone: "5555678901" },
  ];

  // Product options with prices
  const products = [
    { name: "honey", price: 8 },
    { name: "honey bulk", price: 30 },
    { name: "candles small", price: 5 },
    { name: "candles med", price: 10 },
    { name: "candles lg", price: 15 },
    { name: "honey bundle", price: 20 },
  ];

  // Create 10 invoices with linked income records
  for (let i = 0; i < 10; i++) {
    const customer = customers[i % customers.length];
    const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per invoice
    const items = [];
    let total = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
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

  // Create 5 standalone income records
  const standaloneSources = [
    "Farmers Market Sale",
    "Direct Sale - Cash",
    "Online Store",
    "Wholesale Order",
    "Event Sale",
  ];

  for (let i = 0; i < 5; i++) {
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

  console.log("✅ Created 5 standalone income records");
  console.log(
    "🎉 Seed complete: 50 hives (all queen colors), 10 invoices, 5 standalone incomes"
  );
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
