import { NextRequest, NextResponse } from "next/server";
// import { Harvest } from "@/lib/models/harvest"; // placeholder
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const harvest = await prisma.harvest.findFirst({
      where: { id: Number(id), userId: user.id },
    });

    if (!harvest) {
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
    }

    return NextResponse.json(harvest);
  } catch (error) {
    console.error("[HARVEST_GET_BY_ID]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await _req.json();

    // Verify ownership before updating
    const existing = await prisma.harvest.findFirst({
      where: { id: Number(id), userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
    }

    const updated = await prisma.harvest.update({
      where: { id: Number(id) },
      data: {
        harvestAmount: body.harvestAmount,
        harvestType: body.harvestType,
        harvestDate: body.harvestDate ? new Date(body.harvestDate) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[HARVEST_PATCH_BY_ID]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify ownership before deleting
    const existing = await prisma.harvest.findFirst({
      where: { id: Number(id), userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
    }

    await prisma.harvest.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Harvest deleted successfully" });
  } catch (error) {
    console.error("[HARVEST_DELETE_BY_ID]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
