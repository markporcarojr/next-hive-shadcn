import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ClientHarvestList from "../../components/client/HarvestList";

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
  });

  return <ClientHarvestList harvests={harvests} />;
}
