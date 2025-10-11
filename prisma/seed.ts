// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// const baseLat = 42.78793614509639;
// const baseLng = -83.7728352473335;

// function randomOffset() {
//   // ~within 0.001 lat/lng degrees (a few hundred feet)
//   return (Math.random() - 0.5) * 0.002;
// }

// async function main() {
//   const clerkId = "user_33R1nUHO96g8kFoXIMHeak7dVQn";
//   const user = await prisma.user.findUnique({ where: { clerkId } });
//   if (!user) throw new Error(`❌ No user found with clerkId ${clerkId}`);
//   const userId = user.id;

//   // ===================================================
//   // CLEAN EXISTING DATA (order matters due to FKs)
//   // ===================================================
//   await prisma.expense.deleteMany();
//   await prisma.harvest.deleteMany();
//   await prisma.inspection.deleteMany();
//   await prisma.inventory.deleteMany();
//   await prisma.invoiceItem.deleteMany();
//   await prisma.invoice.deleteMany();
//   await prisma.income.deleteMany();
//   await prisma.hive.deleteMany();
//   await prisma.swarmTrap.deleteMany();
//   await prisma.settings.deleteMany();

//   console.log("🗑️ Cleared old data");

//   // ===================================================
//   // SWARM TRAPS
//   // ===================================================
//   const traps = await Promise.all(
//     Array.from({ length: 5 }).map((_, i) =>
//       prisma.swarmTrap.create({
//         data: {
//           label: `Trap ${i + 1}`,
//           installedAt: new Date(`2024-05-${(i % 28) + 1}`),
//           latitude: baseLat + randomOffset(),
//           longitude: baseLng + randomOffset(),
//           notes: i % 2 === 0 ? "In tree line" : "Near field edge",
//           userId,
//         },
//       })
//     )
//   );
//   console.log(`✅ Created ${traps.length} swarm traps`);

//   // ===================================================
//   // HIVES
//   // ===================================================
//   const queenColors = ["Blue", "White", "Yellow", "Red", "Green"];
//   const hives = await Promise.all(
//     Array.from({ length: 20 }).map((_, i) =>
//       prisma.hive.create({
//         data: {
//           hiveNumber: 100 + i,
//           hiveSource: i % 2 === 0 ? "Captured Swarm" : "Nuc Purchase",
//           hiveDate: new Date(`2024-06-${(i % 28) + 1}`),
//           broodBoxes: 2,
//           superBoxes: i % 2 === 0 ? 1 : 2,
//           queenColor: queenColors[i % queenColors.length],
//           queenExcluder: "Yes",
//           hiveStrength: 6 + (i % 10),
//           latitude: baseLat + randomOffset(),
//           longitude: baseLng + randomOffset(),
//           isFromSwarmTrap: i % 2 === 0,
//           swarmTrapId: i % 2 === 0 ? traps[i % traps.length].id : null,
//           todo: i % 3 === 0 ? "Add super" : "Check queen",
//           userId,
//         },
//       })
//     )
//   );
//   console.log(`✅ Created ${hives.length} hives`);

//   // ===================================================
//   // INSPECTIONS
//   // ===================================================
//   const temperaments = ["Calm", "Defensive", "Neutral"];
//   for (const hive of hives.slice(0, 10)) {
//     for (let i = 0; i < 3; i++) {
//       await prisma.inspection.create({
//         data: {
//           hiveId: hive.id,
//           inspectionDate: new Date(`2024-08-${(i % 28) + 1}`),
//           temperament: temperaments[i % temperaments.length],
//           hiveStrength: 4 + (i % 6),
//           brood: i % 2 === 0,
//           queen: true,
//           feeding: i % 2 === 0 ? "Sugar syrup" : "None",
//           pests: i % 3 === 0 ? "Varroa mites" : null,
//           inspectionNote: i % 2 === 0 ? "Healthy colony" : "Monitor activity",
//           userId,
//         },
//       });
//     }
//   }
//   console.log("✅ Seeded Inspections");

//   // ===================================================
//   // HARVESTS (2019–2025)
//   // ===================================================
//   console.log("🌸 Seeding 6 years of harvest data...");
//   const startYear = 2019;
//   const endYear = 2025;
//   const harvestTypes = ["Honey", "Wax", "Propolis", "Pollen"];
//   let totalHarvests = 0;

//   for (let year = startYear; year <= endYear; year++) {
//     const numHarvests = Math.floor(Math.random() * 10) + 10;
//     for (let i = 0; i < numHarvests; i++) {
//       const month = Math.floor(Math.random() * 12) + 1;
//       const day = Math.floor(Math.random() * 28) + 1;
//       const hive = hives[Math.floor(Math.random() * hives.length)];
//       await prisma.harvest.create({
//         data: {
//           harvestType:
//             harvestTypes[Math.floor(Math.random() * harvestTypes.length)],
//           harvestAmount: Math.random() * 60 + 5,
//           harvestDate: new Date(
//             `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
//           ),
//           userId,
//         },
//       });
//       totalHarvests++;
//     }
//   }
//   console.log(`✅ Seeded ${totalHarvests} harvest records`);

//   // ===================================================
//   // INVENTORY
//   // ===================================================
//   const inventoryItems = [
//     { name: "Jars", location: "Storage Shed" },
//     { name: "Frames", location: "Workshop" },
//     { name: "Bee Suit", location: "Garage" },
//     { name: "Smoker", location: "Truck" },
//   ];
//   for (const item of inventoryItems) {
//     await prisma.inventory.create({
//       data: {
//         name: item.name,
//         location: item.location,
//         quantity: Math.floor(Math.random() * 20) + 1,
//         userId,
//       },
//     });
//   }
//   console.log("✅ Seeded Inventory");

//   // ===================================================
//   // INVOICES + INCOME
//   // ===================================================
//   const customers = [
//     { name: "John Smith", email: "john@example.com", phone: "5551234567" },
//     { name: "Sarah Johnson", email: "sarah@example.com", phone: "5552345678" },
//     { name: "Mike Brown", email: "mike@example.com", phone: "5553456789" },
//     { name: "Emily Davis", email: "emily@example.com", phone: "5554567890" },
//     { name: "David Wilson", email: "david@example.com", phone: "5555678901" },
//   ];

//   const products = [
//     { name: "Honey Jar", price: 8 },
//     { name: "Bulk Honey", price: 30 },
//     { name: "Candle Small", price: 5 },
//     { name: "Candle Medium", price: 10 },
//     { name: "Candle Large", price: 15 },
//     { name: "Honey Bundle", price: 20 },
//   ];

//   for (let i = 0; i < 10; i++) {
//     const customer = customers[i % customers.length];
//     const numItems = Math.floor(Math.random() * 3) + 1;
//     let total = 0;
//     const items: { product: string; quantity: number; unitPrice: number }[] =
//       [];

//     for (let j = 0; j < numItems; j++) {
//       const product = products[Math.floor(Math.random() * products.length)];
//       const quantity = Math.floor(Math.random() * 3) + 1;
//       total += product.price * quantity;
//       items.push({ product: product.name, quantity, unitPrice: product.price });
//     }

//     const invoice = await prisma.invoice.create({
//       data: {
//         customerName: customer.name,
//         email: customer.email,
//         phone: customer.phone,
//         date: new Date(`2024-${String((i % 12) + 1).padStart(2, "0")}-15`),
//         total: total.toFixed(2),
//         notes: `Invoice #${i + 1} for ${customer.name}`,
//         userId,
//         items: { create: items },
//       },
//     });

//     await prisma.income.create({
//       data: {
//         source: `Invoice - ${customer.name}`,
//         amount: total.toFixed(2),
//         date: invoice.date,
//         notes: `Auto-generated from invoice #${invoice.id}`,
//         invoiceId: invoice.id,
//         userId,
//       },
//     });
//   }
//   console.log("✅ Seeded Invoices and linked Incomes");

//   // ===================================================
//   // EXPENSES
//   // ===================================================
//   const expenseCategories = ["Equipment", "Tools", "Supplies", "Travel"];
//   for (let i = 0; i < 10; i++) {
//     await prisma.expense.create({
//       data: {
//         item: expenseCategories[i % expenseCategories.length],
//         amount: (Math.random() * 200 + 20).toFixed(2),
//         date: new Date(
//           `2024-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`
//         ),
//         notes: "Sample expense",
//         userId,
//       },
//     });
//   }
//   console.log("✅ Seeded Expenses");

//   // ===================================================
//   // SETTINGS (1:1 with user)
//   // ===================================================
//   await prisma.settings.upsert({
//     where: { userId },
//     update: {},
//     create: {
//       userId,
//       hiveAddress: "123 Bee Farm Rd, Linden, MI",
//       darkMode: true,
//     },
//   });
//   console.log("✅ Seeded Settings");

//   console.log("🎉 FULL SEED COMPLETE!");
// }

// main()
//   .catch((err) => {
//     console.error("❌ Seed failed:", err);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

// user_33sr53Z3M7iNuPJkENWuxdpfwH8  //

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const baseLat = 42.78793614509639;
const baseLng = -83.7728352473335;

function randomOffset() {
  // ~within 0.001 lat/lng degrees (a few hundred feet)
  return (Math.random() - 0.5) * 0.002;
}

async function main() {
  // 🔐 Guest demo user — replace with your real Clerk ID later
  const guestEmail = "guest_demo@next-hive.app";
  const guestClerkId = "user_33sr53Z3M7iNuPJkENWuxdpfwH8"; // your own ID once created in Clerk

  let guestUser = await prisma.user.findUnique({
    where: { email: guestEmail },
  });

  if (!guestUser) {
    guestUser = await prisma.user.create({
      data: {
        name: "Guest Beekeeper",
        email: guestEmail,
        clerkId: guestClerkId,
      },
    });
    console.log("✅ Created Guest User");
  }

  const userId = guestUser.id;

  // Clear existing data for this guest user only
  await prisma.expense.deleteMany({ where: { userId } });
  await prisma.harvest.deleteMany({ where: { userId } });
  await prisma.inspection.deleteMany({ where: { userId } });
  await prisma.inventory.deleteMany({ where: { userId } });
  await prisma.invoiceItem.deleteMany({
    where: { invoice: { userId } },
  });
  await prisma.invoice.deleteMany({ where: { userId } });
  await prisma.income.deleteMany({ where: { userId } });
  await prisma.hive.deleteMany({ where: { userId } });
  await prisma.swarmTrap.deleteMany({ where: { userId } });
  await prisma.settings.deleteMany({ where: { userId } });

  console.log("🧹 Cleared existing demo data");

  // ================
  // Demo Swarm Traps
  // ================
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
  console.log(`✅ Created ${traps.length} swarm traps`);

  // ================
  // Demo Hives
  // ================
  const queenColors = ["Blue", "White", "Yellow", "Red", "Green"];
  const hives = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
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
          isFromSwarmTrap: i % 2 === 0,
          userId,
        },
      })
    )
  );
  console.log(`✅ Created ${hives.length} demo hives`);

  // ================
  // Harvests (6 years of data)
  // ================
  const now = new Date();
  const harvests = [];
  for (let year = 2020; year <= 2025; year++) {
    for (let i = 0; i < 3; i++) {
      harvests.push({
        harvestType: i % 2 === 0 ? "Honey" : "Wax",
        harvestAmount: Math.random() * 80 + 20,
        harvestDate: new Date(
          `${year}-${(i + 5).toString().padStart(2, "0")}-15`
        ),
        userId,
      });
    }
  }
  await prisma.harvest.createMany({ data: harvests });
  console.log(`✅ Seeded ${harvests.length} harvest records`);

  // ================
  // Income & Invoices
  // ================
  const customers = [
    { name: "John Smith", email: "john@example.com", phone: "5551234567" },
    { name: "Sarah Johnson", email: "sarah@example.com", phone: "5552345678" },
    { name: "Mike Brown", email: "mike@example.com", phone: "5553456789" },
  ];
  const products = [
    { name: "Honey Jar", price: 8 },
    { name: "Candle", price: 12 },
    { name: "Wax Block", price: 20 },
  ];

  for (let i = 0; i < 5; i++) {
    const customer = customers[i % customers.length];
    const product = products[i % products.length];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const total = product.price * quantity;
    const invoiceDate = new Date(`2025-0${(i % 9) + 1}-10`);

    const invoice = await prisma.invoice.create({
      data: {
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone,
        date: invoiceDate,
        total,
        notes: `Demo Invoice #${i + 1}`,
        userId,
        items: {
          create: [
            { product: product.name, quantity, unitPrice: product.price },
          ],
        },
      },
    });

    await prisma.income.create({
      data: {
        source: `Invoice - ${customer.name}`,
        amount: total,
        date: invoiceDate,
        notes: `Generated from demo invoice #${invoice.id}`,
        invoiceId: invoice.id,
        userId,
      },
    });
  }

  console.log("✅ Created demo invoices & incomes");

  // ================
  // Expenses
  // ================
  const expenseCategories = ["Equipment", "Supplies", "Travel", "Maintenance"];
  for (let i = 0; i < 6; i++) {
    await prisma.expense.create({
      data: {
        item: expenseCategories[i % expenseCategories.length],
        amount: parseFloat((Math.random() * 250 + 50).toFixed(2)),
        date: new Date(`2025-${(i % 12) + 1}-05`),
        notes: "Demo expense entry",
        userId,
      },
    });
  }
  console.log("✅ Seeded demo expenses");

  // ================
  // Inventory
  // ================
  const inventoryItems = [
    { name: "Jars", location: "Storage Shed" },
    { name: "Frames", location: "Workshop" },
    { name: "Bee Suit", location: "Garage" },
    { name: "Smoker", location: "Truck" },
  ];
  for (const item of inventoryItems) {
    await prisma.inventory.create({
      data: {
        name: item.name,
        location: item.location,
        quantity: Math.floor(Math.random() * 20) + 1,
        userId,
      },
    });
  }
  console.log("✅ Seeded demo inventory");

  // ================
  // Inspections
  // ================
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
  }
  console.log("✅ Seeded demo inspections");

  // ================
  // Settings
  // ================
  await prisma.settings.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      hiveAddress: "123 Demo Apiary Rd, Linden, MI",
      darkMode: false,
    },
  });

  console.log("🎉 Demo seed complete!");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
