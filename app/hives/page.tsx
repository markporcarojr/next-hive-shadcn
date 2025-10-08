import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { HiveTable } from "./hive-table";
import { Button } from "@/components/ui/button";
import type { HiveInput } from "@/lib/schemas/hive";
import { unstable_cache } from "next/cache"; // ✅ Built-in Next.js cache

// ✅ Cache server response for 30s
export const revalidate = 30;

// ✅ Reusable cached Prisma query
const getCachedHives = unstable_cache(
  async (clerkId: string): Promise<HiveInput[]> => {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        Hive: {
          orderBy: { hiveNumber: "asc" },
        },
      },
    });

    if (!user) return [];

    // Sanitize optional fields for consistent shape
    return user.Hive.map((hive) => ({
      ...hive,
      breed: hive.breed ?? undefined,
      broodBoxes: hive.broodBoxes ?? undefined,
      frames: hive.frames ?? undefined,
      hiveImage: hive.hiveImage ?? undefined,
      hiveStrength: hive.hiveStrength ?? undefined,
      latitude: hive.latitude ?? undefined,
      longitude: hive.longitude ?? undefined,
      queenAge: hive.queenAge ?? undefined,
      queenColor: hive.queenColor ?? undefined,
      queenExcluder: hive.queenExcluder ?? undefined,
      superBoxes: hive.superBoxes ?? undefined,
      todo: hive.todo ?? undefined,
    }));
  },
  ["hives"], // ✅ Global cache key
  { revalidate: 30 } // Re-fetch every 30s
);

export default async function HivePage() {
  // 🔐 Clerk authentication
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  // ⚡ Fetch cached data
  const hives = await getCachedHives(clerkId);

  // 🖥️ Render
  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg border">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Your Hives</h2>
        <Button asChild>
          <Link href="/hives/new" prefetch>
            Add Hive
          </Link>
        </Button>
      </header>

      <HiveTable data={hives} />
    </main>
  );
}
