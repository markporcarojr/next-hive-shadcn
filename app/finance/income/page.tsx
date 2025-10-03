import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import IncomeTable from "./income-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function IncomePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return notFound();

  const incomes = await prisma.income.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    select: {
      id: true,
      source: true,
      amount: true,
      date: true,
      invoiceId: true,
    },
  });

  // ✅ serialize for client
  const plainIncomes = incomes.map((i) => ({
    id: i.id,
    source: i.source,
    amount: Number(i.amount),
    date: i.date.toISOString(),
    invoiceId: i.invoiceId,
  }));

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Your Incomes</h2>
        <Button asChild>
          <Link href="/finance/income/new">Add Income</Link>
        </Button>
      </div>
      <IncomeTable data={plainIncomes} />
    </main>
  );
}
