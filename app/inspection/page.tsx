import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ClientInspectionList from "../../components/client/InspectionList";
import { InspectionWithHive } from "@/lib/schemas/inspection";
import InspectionTable from "./inspection-table";

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

  return <InspectionTable inspections={sanitized} />;
}
