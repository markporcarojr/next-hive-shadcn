import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ClientHiveList from "../../components/client/HiveList";
import { HiveInput } from "@/lib/schemas/hive";

export default async function HivePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return notFound();

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

  return <ClientHiveList hives={sanitized} />;
}
