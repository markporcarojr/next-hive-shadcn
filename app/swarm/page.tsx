import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import SwarmTable from "./swarm-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SwarmInput } from "@/lib/schemas/swarmTrap";
import TrapMap from "@/components/trap-map";

export default async function SwarmPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return notFound();

  const swarms = await prisma.swarmTrap.findMany({
    where: { userId: user.id },
    orderBy: { installedAt: "desc" },
  });

  const sanitized: SwarmInput[] = swarms.map((swarm) => ({
    id: swarm.id,
    label: swarm.label,
    latitude: swarm.latitude,
    longitude: swarm.longitude,
    installedAt: swarm.installedAt,
    removedAt: swarm.removedAt ?? undefined,
    notes: swarm.notes ?? undefined,
  }));

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Swarm Traps</h2>
        <Button asChild>
          <Link href="/swarm/new">Add Trap</Link>
        </Button>
      </div>
      <SwarmTable swarms={sanitized} />
      <TrapMap zoom={15} height={"400px"} />
    </main>
  );
}
