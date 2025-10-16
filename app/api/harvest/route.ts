import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { harvestFormSchema } from "@/lib/schemas/harvest";

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
    const parsed = harvestFormSchema.safeParse({
      ...body,
      harvestDate: new Date(body.harvestDate), // ✅ ensure it's a Date before Zod
    });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const harvest = await prisma.harvest.create({
      data: {
        ...parsed.data,
        userId: user.id,
      },
    });

    return NextResponse.json(harvest, { status: 201 });
  } catch (error) {
    console.error("[HARVEST_POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find matching user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const harvests = await prisma.harvest.findMany({
      where: { userId: user.id },
      orderBy: { harvestDate: "desc" },
    });

    return NextResponse.json(harvests);
  } catch (error) {
    console.error("[HARVEST_GET]", error);
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
      return NextResponse.json(
        { error: "Missing or invalid harvest ID" },
        { status: 400 }
      );
    }

    const harvest = await prisma.harvest.deleteMany({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (harvest.count === 0) {
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Harvest deleted successfully" });
  } catch (error) {
    console.error("[HARVEST_DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/harvest?id=123
export async function PATCH(_req: NextRequest) {
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

    const url = new URL(_req.url);
    const id = url.searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Missing or invalid harvest ID" },
        { status: 400 }
      );
    }

    const body = await _req.json();

    // ✅ Convert harvestDate BEFORE validation
    const parsed = harvestFormSchema.safeParse({
      ...body,
      harvestDate: new Date(body.harvestDate),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { harvestType, harvestAmount, harvestDate } = parsed.data;

    const updated = await prisma.harvest.updateMany({
      where: { id: Number(id), userId: user.id },
      data: {
        harvestType,
        harvestAmount,
        harvestDate, // already a Date from parsed.data
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Harvest not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Harvest updated" });
  } catch (error) {
    console.error("[HARVEST_PATCH]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
