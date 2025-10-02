import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import IncomeTable from "./income-table";

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

  return <IncomeTable data={plainIncomes} />;
}
