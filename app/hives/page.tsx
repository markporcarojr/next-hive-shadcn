import { prisma } from "@/lib/prisma";
import { HiveInput } from "@/lib/schemas/hive";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { HiveTable } from "./hive-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HivePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return notFound();

  const hives = await prisma.hive.findMany({
    where: { userId: user.id },
    orderBy: { hiveNumber: "asc" },
  });

  const sanitized: HiveInput[] = hives
    .filter((hive) => hive.id !== undefined)
    .map((hive) => ({
      id: hive.id as number,
      hiveDate: hive.hiveDate,
      hiveNumber: hive.hiveNumber,
      hiveSource: hive.hiveSource,
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

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Your Hives</h2>
        <Button asChild>
          <Link href="/hives/new">Add Hive</Link>
        </Button>
      </div>
      <HiveTable data={sanitized} />
    </main>
  );
}
