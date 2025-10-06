import { SectionCards } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { HiveInput } from "@/lib/schemas/hive";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HiveTableWrapper } from "./hive-table-wrapper";
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

  const hives = await prisma.hive.findMany({
    where: { userId: user.id },
    orderBy: { hiveNumber: "asc" },
  });

  const sanitized: HiveInput[] = hives.map((hive) => ({
    id: hive.id,
    hiveDate: hive.hiveDate,
    hiveNumber: hive.hiveNumber,
    hiveSource: hive.hiveSource,
    breed: hive.breed ?? undefined,
    broodBoxes: hive.broodBoxes ?? undefined,
    frames: hive.frames ?? undefined,
    hiveImage: hive.hiveImage ?? undefined,
    hiveStrength: hive.hiveStrength ?? undefined,
    latitude: hive.latitude ?? undefined,
    longitude: hive.longitude ?? undefined,
    queenAge: hive.queenAge ?? undefined,
    queenColor: hive.queenColor ?? undefined,
    queenExcluder: hive.queenExcluder ?? undefined,
    superBoxes: hive.superBoxes ?? undefined,
    todo: hive.todo ?? undefined,
  }));

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg ">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Button asChild>
            <Link href="/hives/new">Add Hive</Link>
          </Button>
        </div>
        <HiveTableWrapper data={sanitized} />
        <SectionCards expenses={expenses} incomes={incomes} />
        {/* <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div> */}
      </div>
    </main>
  );
}
