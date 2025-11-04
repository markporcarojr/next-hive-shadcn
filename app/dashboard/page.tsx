import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import HiveTable from "../hives/hive-table";
import { HarvestFinanceChart } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { HiveInput } from "@/lib/schemas/hive";
import ApiaryMapWrapper from "@/components/apiary-map-wrapper";

export default async function Page() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return;

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return notFound();

  // 🔹 Helper to safely serialize Prisma records
  const serializeDates = <T extends Record<string, unknown>>(obj: T): T =>
    JSON.parse(
      JSON.stringify(obj, (key, value) =>
        value instanceof Date ? value.toISOString() : value
      )
    ) as T;

  const [harvestsRaw, incomesRaw, expensesRaw, hives] = await Promise.all([
    prisma.harvest.findMany({
      where: { userId: user.id },
      orderBy: { harvestDate: "desc" },
    }),
    prisma.income.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
    prisma.hive.findMany({
      where: { userId: user.id },
      orderBy: { hiveNumber: "asc" },
    }),
  ]);

  // 🔹 Convert Dates → Strings before passing to client components
  const harvests = harvestsRaw.map((h) =>
    serializeDates({
      id: h.id,
      userId: h.userId,
      harvestType: h.harvestType,
      harvestAmount: Number(h.harvestAmount),
      harvestDate: h.harvestDate,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    })
  );

  const incomes = incomesRaw.map((i) =>
    serializeDates({
      id: i.id,
      userId: i.userId,
      amount: Number(i.amount),
      source: i.source,
      date: i.date,
      notes: i.notes ?? "",
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    })
  );

  const expenses = expensesRaw.map((e) =>
    serializeDates({
      id: e.id,
      userId: e.userId,
      item: e.item,
      amount: Number(e.amount),
      date: e.date,
      notes: e.notes ?? "",
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })
  );

  const sanitized: HiveInput[] = hives.map((h) => ({
    id: h.id,
    hiveDate: h.hiveDate as Date,
    hiveNumber: h.hiveNumber,
    hiveSource: h.hiveSource,
    breed: h.breed ?? undefined,
    broodBoxes: h.broodBoxes ?? undefined,
    frames: h.frames ?? undefined,
    hiveImage: h.hiveImage ?? undefined,
    hiveStrength: h.hiveStrength ?? undefined,
    latitude: h.latitude ?? undefined,
    longitude: h.longitude ?? undefined,
    queenAge: h.queenAge ?? undefined,
    queenColor: h.queenColor ?? undefined,
    queenExcluder: h.queenExcluder ?? undefined,
    superBoxes: h.superBoxes ?? undefined,
    todo: h.todo ?? undefined,
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

        <HiveTable data={sanitized} />

        {/* ✅ Safe: All date fields are now strings */}
        <HarvestFinanceChart
          harvests={harvests}
          incomes={incomes}
          expenses={expenses}
        />

        <SectionCards expenses={expenses} incomes={incomes} />

        <ApiaryMapWrapper />
      </div>
    </main>
  );
}
