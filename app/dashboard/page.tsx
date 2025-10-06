import { SectionCards } from "@/components/section-cards";
import { prisma } from "@/lib/prisma";
import { HiveInput } from "@/lib/schemas/hive";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { HiveTable } from "../hives/hive-table";
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
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <HiveTable data={sanitized} />
        <SectionCards expenses={expenses} incomes={incomes} />
        {/* <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div> */}
      </div>
    </div>
  );
}
