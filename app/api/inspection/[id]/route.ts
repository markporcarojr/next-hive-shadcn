import { prisma } from "@/lib/prisma";
import { inspectionApiSchema } from "@/lib/schemas/inspection";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all inspections for the current user
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  const { id } = await params;
  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId,
      },
    });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const inspection = await prisma.inspection.findUnique({
      where: {
        id: Number(id),
        userId: user.id,
      },
      include: {
        hive: true, // Include hive details
      },
    });

    if (!inspection) {
      return new NextResponse("Inspection not found", { status: 404 });
    }

    return NextResponse.json(inspection);
  } catch (error) {
    console.error("[INSPECTION_GET]", error);
    return new NextResponse("Server error", { status: 500 });
  }
}

// PATCH: Update an existing inspection
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  const { id } = await params;
  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await _req.json();
    const parsedData = inspectionApiSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.issues },
        { status: 400 }
      );
    }

    const updatedInspection = await prisma.inspection.update({
      where: {
        id: Number(id),
        userId: user.id,
      },
      data: {
        ...parsedData.data,
        inspectionDate: new Date(parsedData.data.inspectionDate),
      },
    });

    return NextResponse.json(updatedInspection, { status: 200 });
  } catch (error) {
    console.error("[INSPECTION_PATCH]", error);
    return new NextResponse("Server error", { status: 500 });
  }
}

// DELETE: Delete an inspection
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  const { id } = await params;
  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const deletedInspection = await prisma.inspection.delete({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    return NextResponse.json(deletedInspection, { status: 200 });
  } catch (error) {
    console.error("[INSPECTION_DELETE]", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
