import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import HarvestTable from "./harvest-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HarvestPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return notFound();

  const harvests = await prisma.harvest.findMany({
    where: { userId: user.id },
    orderBy: { harvestDate: "desc" },
    select: {
      id: true,
      harvestType: true,
      harvestAmount: true,
      harvestDate: true,
    },
  });

  const plainHarvests = harvests.map((h) => ({
    id: h.id,
    harvestType: h.harvestType,
    harvestAmount: Number(h.harvestAmount),
    harvestDate: h.harvestDate.toISOString(),
  }));

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Your Harvests</h2>
        <Button asChild>
          <Link href="/harvest/new">Add Harvest</Link>
        </Button>
      </div>
      <HarvestTable data={plainHarvests} />
    </main>
  );
}
