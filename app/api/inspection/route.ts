import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { inspectionSchema } from "@/lib/schemas/inspection";

// GET: Fetch all inspections for the current user
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();

  try {
    if (!clerkId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const inspections = await prisma.inspection.findMany({
      where: { userId: user.id },
      orderBy: { inspectionDate: "desc" },
      include: {
        hive: true, // 👈 This gives you hive.hiveNumber
      },
    });

    return NextResponse.json(inspections);
  } catch (error) {
    console.error("[INSPECTION_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create a new inspection
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = inspectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

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
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE: /api/inspections?id=123
export async function DELETE(req: NextRequest) {
  const { userId: clerkId } = await auth();
  try {
    if (!clerkId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const result = await prisma.inspection.deleteMany({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { message: "Inspection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Inspection deleted" });
  } catch (error) {
    console.error("[HIVE_ERROR]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
