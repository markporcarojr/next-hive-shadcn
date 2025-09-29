import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { harvestApiSchema } from "@/lib/schemas/harvest";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const harvest = await prisma.harvest.findFirst({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    if (!harvest)
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });

    return NextResponse.json(harvest);
  } catch (error) {
    console.error("[HARVEST_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch harvest" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    const convertedBody = {
      ...body,
      harvestDate: new Date(body.harvestDate),
    };

    const parsed = harvestApiSchema.safeParse(convertedBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const harvest = await prisma.harvest.update({
      where: { id: Number(resolvedParams.id), userId: user.id },
      data: parsed.data,
    });

    return NextResponse.json(harvest);
  } catch (error) {
    console.error("[HARVEST_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update harvest" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const harvest = await prisma.harvest.deleteMany({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    if (harvest.count === 0)
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });

    return NextResponse.json({ message: "Harvest deleted successfully" });
  } catch (error) {
    console.error("[HARVEST_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete harvest" },
      { status: 500 }
    );
  }
}
