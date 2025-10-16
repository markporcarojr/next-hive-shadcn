import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { hiveApiSchema } from "@/lib/schemas/hive";

// GET: /api/hives
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

    const hives = await prisma.hive.findMany({
      where: { userId: user.id },
      orderBy: { hiveDate: "desc" },
    });

    return NextResponse.json(hives);
  } catch (error) {
    console.error("[HIVES_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: /api/hives
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
    const convertedBody = {
      ...body,
      hiveDate: new Date(body.hiveDate), // Convert to Date object for validation
    };
    const parsed = hiveApiSchema.safeParse(convertedBody);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existingHive = await prisma.hive.findFirst({
      where: {
        hiveNumber: data.hiveNumber,
        userId: user.id,
      },
      select: { id: true },
    });

    if (existingHive) {
      return NextResponse.json(
        { error: `Hive number ${data.hiveNumber} already exists.` },
        { status: 409 }
      );
    }

    const hive = await prisma.hive.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    return NextResponse.json(hive, { status: 201 });
  } catch (error) {
    console.error("[HIVE_POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid hive ID" }, { status: 400 });
    }

    // Attempt to delete
    const result = await prisma.hive.deleteMany({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Hive not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hive deleted successfully" });
  } catch (error) {
    console.error("[HIVE_DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
