import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ClientSwarmList from "../../components/client/SwarmList";
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
    <>
      <ClientSwarmList swarms={sanitized} />
      <TrapMap zoom={15} height={"100%"} />
    </>
  );
}
