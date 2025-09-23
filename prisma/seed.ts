import { PrismaClient } from "@prisma/client";

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

  // Create 50 hives only
  await Promise.all(
    Array.from({ length: 50 }).map((_, i) =>
      prisma.hive.create({
        data: {
          hiveNumber: 100 + i,
          hiveSource: i % 2 === 0 ? "Captured Swarm" : "Nuc Purchase",
          hiveDate: new Date(`2025-06-${(i % 28) + 1}`),
          broodBoxes: 2,
          superBoxes: i % 2 === 0 ? 1 : 2,
          queenColor: ["Blue", "Yellow", "Green"][i % 3],
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

  console.log("✅ Seed complete: 50 hives created.");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
