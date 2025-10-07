import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import InventoryTable from "./inventory-table";

import { InventoryInput } from "@/lib/schemas/inventory";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <Button asChild>
          <Link href="/inventory/new">Add Item</Link>
        </Button>
      </div>
      <InventoryTable items={sanitized} />
    </main>
  );
}
