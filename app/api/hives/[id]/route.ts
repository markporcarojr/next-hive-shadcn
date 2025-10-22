import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { hiveApiSchema } from "@/lib/schemas/hive";

// GET /api/hives/[id]
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const hive = await prisma.hive.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (!hive) {
      return NextResponse.json({ error: "Hive not found" }, { status: 404 });
    }

    return NextResponse.json(hive);
  } catch (error) {
    console.error("[HIVE_GET_BY_ID]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/hives/[id]
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const convertedBody = {
      ...body,
      hiveDate: body.hiveDate ? new Date(body.hiveDate) : undefined,
      swarmCaptureDate: body.swarmCaptureDate
        ? new Date(body.swarmCaptureDate)
        : undefined,
    };
    const parsed = hiveApiSchema.safeParse(convertedBody);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verify ownership before updating
    const existingHive = await prisma.hive.findFirst({
      where: {
        id: Number(id),
        userId: user.id,
      },
      select: { id: true },
    });

    if (!existingHive) {
      return NextResponse.json({ error: "Hive not found" }, { status: 404 });
    }

    const hive = await prisma.hive.update({
      where: { id: Number(id) },
      data: {
        ...parsed.data,
      },
    });

    return NextResponse.json(hive);
  } catch (error) {
    console.error("[HIVE_PATCH_BY_ID]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
