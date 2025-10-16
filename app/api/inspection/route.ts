import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { inspectionApiSchema } from "@/lib/schemas/inspection";

// GET: Fetch all inspections for the current user
export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const inspections = await prisma.inspection.findMany({
      where: { userId: user.id },
      orderBy: { inspectionDate: "desc" },
      include: {
        hive: {
          select: {
            id: true,
            hiveNumber: true,
            hiveSource: true,
          },
        },
      },
    });

    return NextResponse.json(inspections);
  } catch (error) {
    console.error("[INSPECTION_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a new inspection
export async function POST(_req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await _req.json();
    const parsed = inspectionApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify hive ownership
    const hive = await prisma.hive.findFirst({
      where: {
        id: data.hiveId,
        userId: user.id,
      },
      select: { id: true },
    });

    if (!hive) {
      return NextResponse.json(
        { error: "Hive not found or unauthorized" },
        { status: 404 }
      );
    }

    const inspection = await prisma.inspection.create({
      data: {
        ...data,
        inspectionDate: new Date(data.inspectionDate),
        userId: user.id,
      },
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error("[INSPECTION_POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: /api/inspections?id=123
export async function DELETE(req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await prisma.inspection.deleteMany({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Inspection deleted" });
  } catch (error) {
    console.error("[INSPECTION_DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
