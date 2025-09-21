import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ClientInventoryList from "../../components/client/InventoryList";
import { InventoryInput } from "@/lib/schemas/inventory";

export default async function InventoryPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return notFound();

  const items = await prisma.inventory.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  const sanitized: InventoryInput[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    location: item.location,
  }));

  return <ClientInventoryList items={sanitized} />;
}