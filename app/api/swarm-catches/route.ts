import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const trapId = searchParams.get("trapId");

  const catches = await prisma.swarmCatch.findMany({
    where: {
      userId: user.id,
      ...(trapId ? { trapId: parseInt(trapId) } : {}),
    },
    include: { hive: { select: { hiveNumber: true } } },
    orderBy: { catchDate: "desc" },
  });

  return NextResponse.json(catches);
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { trapId, catchDate, notes } = await req.json();

  if (!trapId || !catchDate) {
    return NextResponse.json(
      { error: "trapId and catchDate are required" },
      { status: 400 },
    );
  }

  const swarmCatch = await prisma.swarmCatch.create({
    data: {
      trapId: parseInt(trapId),
      catchDate: new Date(catchDate),
      notes: notes || null,
      userId: user.id,
    },
  });

  return NextResponse.json(swarmCatch, { status: 201 });
}
