import { prisma } from "@/lib/prisma";
import { InspectionWithHive } from "@/lib/schemas/inspection";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import InspectionTable from "./inspection-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function InspectionPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return notFound();

  const inspections = await prisma.inspection.findMany({
    where: { userId: user.id },
    include: {
      hive: {
        select: { hiveNumber: true },
      },
    },
    orderBy: { inspectionDate: "desc" },
  });

  const sanitized: InspectionWithHive[] = inspections.map((inspection) => ({
    id: inspection.id,
    hiveId: inspection.hiveId,
    temperament: inspection.temperament,
    hiveStrength: inspection.hiveStrength,
    inspectionDate: inspection.inspectionDate,
    inspectionImage: inspection.inspectionImage ?? undefined,
    queen: inspection.queen ?? false,
    queenCell: inspection.queenCell ?? false,
    brood: inspection.brood ?? false,
    disease: inspection.disease ?? false,
    eggs: inspection.eggs ?? false,
    pests: inspection.pests ?? undefined,
    feeding: inspection.feeding ?? undefined,
    treatments: inspection.treatments ?? undefined,
    inspectionNote: inspection.inspectionNote ?? undefined,
    weatherCondition: inspection.weatherCondition ?? undefined,
    weatherTemp: inspection.weatherTemp ?? undefined,
    hive: {
      hiveNumber: inspection.hive.hiveNumber,
    },
  }));

  return (
    <main className="w-full max-w-6xl mx-auto flex flex-col gap-6 p-6 bg-background rounded-xl shadow-lg border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Your Inspections</h2>
        <Button asChild>
          <Link href="/inspection/new">Add Inspection</Link>
        </Button>
      </div>
      <InspectionTable inspections={sanitized} />
    </main>
  );
}
