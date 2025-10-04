import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import InvoiceTable from "./invoice-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function InvoicePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return notFound();

  const invoices = await prisma.invoice.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const invoicesWithNumberTotal = invoices.map((invoice) => ({
    ...invoice,
    total:
      typeof invoice.total === "object" && "toNumber" in invoice.total
        ? invoice.total.toNumber()
        : Number(invoice.total),
  }));

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Your Invoices</h2>
        <Button asChild>
          <Link href="/finance/invoices/new">Add Invoice</Link>
        </Button>
      </div>
      <InvoiceTable invoices={invoicesWithNumberTotal} />
    </main>
  );
}
