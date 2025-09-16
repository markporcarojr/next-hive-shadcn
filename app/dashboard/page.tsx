import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function Page() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return; // Optional: redirect instead

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return notFound();

  const expensesRaw = await prisma.expense.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const expenses = expensesRaw.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
    notes: expense.notes ?? undefined,
  }));

  const incomesRaw = await prisma.income.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const incomes = incomesRaw.map((income) => ({
    ...income,
    amount: Number(income.amount),
    notes: income.notes ?? undefined,
  }));

  return (
    <div className="flex flex-col gap-6 p-6">
      <SectionCards expenses={expenses} incomes={incomes} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      {/* <DataTable data={data} /> */}
    </div>
  );
}
