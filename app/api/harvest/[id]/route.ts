import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { harvestApiSchema } from "@/lib/schemas/harvest";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const harvest = await prisma.harvest.findUnique({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    if (!harvest)
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });

    return NextResponse.json(harvest);
  } catch (error) {
    console.error("[HARVEST_GET_BY_ID]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const body = await req.json();
    const convertedBody = {
      ...body,
      harvestDate: new Date(body.harvestDate),
    };
    const parsed = harvestApiSchema.safeParse(convertedBody);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.harvest.updateMany({
      where: { id: Number(resolvedParams.id), userId: user.id },
      data: parsed.data,
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { message: "Harvest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Harvest updated successfully" });
  } catch (error) {
    console.error("[HARVEST_PATCH_BY_ID]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const harvest = await prisma.harvest.deleteMany({
      where: {
        id: Number(resolvedParams.id),
        userId: user.id,
      },
    });

    if (harvest.count === 0) {
      return NextResponse.json(
        { message: "Harvest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Harvest deleted successfully" });
  } catch (error) {
    console.error("[HARVEST_DELETE]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
