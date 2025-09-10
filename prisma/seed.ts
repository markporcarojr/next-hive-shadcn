import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const baseLat = 42.78793614509639;
const baseLng = -83.7728352473335;

function randomOffset() {
  // ~within 0.001 lat/lng degrees (a few hundred feet)
  return (Math.random() - 0.5) * 0.002;
}

async function main() {
  const clerkId = "user_327c8quzz0hiX4t5JqiRnRkIGSe";
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error(`❌ No user found with clerkId ${clerkId}`);
  const userId = user.id;

  // 1. SwarmTraps (5)
  const swarmTraps = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.swarmTrap.create({
        data: {
          label: `Trap #${i + 1}`,
          installedAt: new Date(`2025-07-${10 + i}`),
          latitude: baseLat + randomOffset(),
          longitude: baseLng + randomOffset(),
          notes: `Set near site ${i + 1}`,
          userId,
        },
      })
    )
  );

  // 2. Hives (6, 3 from swarm traps)
  const hives = await Promise.all(
    Array.from({ length: 6 }).map((_, i) =>
      prisma.hive.create({
        data: {
          hiveNumber: 100 + i,
          hiveSource: i < 3 ? "Captured Swarm" : "Nuc Purchase",
          hiveDate: new Date(`2025-06-${10 + i}`),
          broodBoxes: 2,
          superBoxes: i % 2 === 0 ? 1 : 2,
          queenColor: ["Blue", "Yellow", "Green"][i % 3],
          queenExcluder: "Yes",
          hiveStrength: 6 + i,
          latitude: baseLat + randomOffset(),
          longitude: baseLng + randomOffset(),
          isFromSwarmTrap: i < 3,
          swarmTrapId: i < 3 ? swarmTraps[i].id : undefined,
          userId,
        },
      })
    )
  );

  // 3. Inspections (one for each hive)
  await Promise.all(
    hives.map((hive, i) =>
      prisma.inspection.create({
        data: {
          inspectionDate: new Date(`2025-07-${15 + i}`),
          hiveId: hive.id,
          userId,
          hiveStrength: hive.hiveStrength ?? 6,
          temperament: i % 2 === 0 ? "Calm" : "Aggressive",
          brood: i % 2 === 0,
          eggs: true,
          queen: true,
          disease: false,
          pests: "None",
          feeding: "Sugar Syrup",
        },
      })
    )
  );

  // 4. Harvests (3)
  await prisma.harvest.createMany({
    data: [
      {
        harvestAmount: 20.5,
        harvestDate: new Date("2025-07-25"),
        harvestType: "Honey",
        userId,
      },
      {
        harvestAmount: 12.0,
        harvestDate: new Date("2025-08-01"),
        harvestType: "Wax",
        userId,
      },
      {
        harvestAmount: 5.5,
        harvestDate: new Date("2025-08-03"),
        harvestType: "Pollen",
        userId,
      },
    ],
  });

  // 5. Inventory (3)
  await prisma.inventory.createMany({
    data: [
      {
        name: "Honey Bottles (16oz)",
        quantity: 120,
        location: "Basement",
        userId,
      },
      { name: "Feeder Pails", quantity: 15, location: "Garage", userId },
      { name: "Candle Molds", quantity: 5, location: "Workshop", userId },
    ],
  });

  // 6. Expenses (3)
  await prisma.expense.createMany({
    data: [
      {
        amount: new Decimal("34.50"),
        date: new Date("2025-07-01"),
        item: "Sugar",
        notes: "Spring feeding",
        userId,
      },
      {
        amount: new Decimal("89.99"),
        date: new Date("2025-07-10"),
        item: "Bee Suit",
        userId,
      },
      {
        amount: new Decimal("12.75"),
        date: new Date("2025-07-20"),
        item: "Jars",
        userId,
      },
    ],
  });

  // 7. Income (3)
  await prisma.income.createMany({
    data: [
      {
        amount: new Decimal("150.00"),
        date: new Date("2025-07-05"),
        source: "Honey Sales",
        userId,
      },
      {
        amount: new Decimal("40.00"),
        date: new Date("2025-07-14"),
        source: "Farmer's Market",
        userId,
      },
      {
        amount: new Decimal("25.00"),
        date: new Date("2025-08-01"),
        source: "Candle Sales",
        userId,
      },
    ],
  });

  // 8. Invoices (3)
  await Promise.all(
    Array.from({ length: 3 }).map((_, i) =>
      prisma.invoice.create({
        data: {
          customerName: `Customer ${i + 1}`,
          date: new Date(`2025-08-0${i + 1}`),
          email: `customer${i + 1}@example.com`,
          phone: `555-100${i + 1}`,
          notes: "Thanks for your business!",
          total: new Decimal("45.00"),
          userId,
          items: {
            create: [
              {
                product: "Honey Jar (16oz)",
                quantity: 2 + i,
                unitPrice: new Decimal("10.00"),
              },
              {
                product: "Candle",
                quantity: 1,
                unitPrice: new Decimal("25.00"),
              },
            ],
          },
        },
      })
    )
  );

  console.log("✅ Seed complete with clustered hives and nearby traps.");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());