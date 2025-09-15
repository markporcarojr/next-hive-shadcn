import { prisma } from "@/lib/prisma";
import { inspectionSchema } from "@/lib/schemas/inspection";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Fetch all inspections for the current user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
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
        id: Number(params.id),
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const parsedData = inspectionSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
      );
    }

    const updatedInspection = await prisma.inspection.update({
      where: {
        id: Number(params.id),
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const deletedInspection = await prisma.inspection.delete({
      where: {
        id: Number(params.id),
        userId: user.id,
      },
    });

    return NextResponse.json(deletedInspection, { status: 200 });
  } catch (error) {
    console.error("[INSPECTION_DELETE]", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
