import { prisma } from "@/lib/prisma";
import { inspectionApiSchema } from "@/lib/schemas/inspection";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch inspection by ID
export async function GET(
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

    const inspection = await prisma.inspection.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
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

    if (!inspection) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("[INSPECTION_GET_BY_ID]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH: Update an existing inspection
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
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify ownership before updating
    const existing = await prisma.inspection.findFirst({
      where: { id: Number(id), userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    const body = await _req.json();
    const parsedData = inspectionApiSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedInspection = await prisma.inspection.update({
      where: { id: Number(id) },
      data: {
        ...parsedData.data,
        inspectionDate: new Date(parsedData.data.inspectionDate),
      },
    });

    return NextResponse.json(updatedInspection);
  } catch (error) {
    console.error("[INSPECTION_PATCH_BY_ID]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Delete an inspection
export async function DELETE(
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
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify ownership before deleting
    const existing = await prisma.inspection.findFirst({
      where: { id: Number(id), userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    await prisma.inspection.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Inspection deleted successfully" });
  } catch (error) {
    console.error("[INSPECTION_DELETE_BY_ID]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
