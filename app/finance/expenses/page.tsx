import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ExpenseTable from "./expense-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ExpensePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return notFound();

  const expenses = await prisma.expense.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    select: {
      id: true,
      item: true,
      amount: true,
      date: true,
    },
  });

  // Pass original expenses with date as Date object
  const formattedExpenses = expenses.map((e) => ({
    id: e.id,
    item: e.item,
    amount: Number(e.amount), // Decimal -> number
    date: e.date, // Keep as Date object
  }));

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg ">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Your Expenses</h2>
        <Button asChild>
          <Link href="/finance/expenses/new">Add Expense</Link>
        </Button>
      </div>
      <ExpenseTable expenses={formattedExpenses} />
    </main>
  );
}
