import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import data from "./data.json";
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
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards expenses={expenses} incomes={incomes} />
        {/* <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div> */}
        <DataTable data={data} />
      </div>
    </div>
  );
}
