import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { harvestSchema } from "@/lib/schemas/harvest";

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
    
    // Ensure harvestDate is in ISO format for validation
    const payload = {
      ...body,
      harvestDate: body.harvestDate instanceof Date 
        ? body.harvestDate.toISOString() 
        : typeof body.harvestDate === 'string' 
          ? body.harvestDate 
          : new Date(body.harvestDate).toISOString()
    };
    
    const parsed = harvestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const harvest = await prisma.harvest.create({
      data: {
        ...parsed.data,
        harvestDate: new Date(parsed.data.harvestDate), // Convert ISO string to Date for Prisma
        userId: user.id,
      },
    });

    return NextResponse.json(harvest, { status: 201 });
  } catch (error) {
    console.error("[HARVEST_POST]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find matching user by Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
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
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: "Missing or invalid harvest ID" },
        { status: 400 }
      );
    }

    const harvest = await prisma.harvest.deleteMany({
      where: {
        id: Number(id), // <-- convert here
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

// PATCH /api/harvest?id=123
// PATCH /api/harvest?id=123
export async function PATCH(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { message: "Missing or invalid harvest ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    // Ensure harvestDate is in ISO format for validation
    const payload = {
      ...body,
      harvestDate: body.harvestDate instanceof Date 
        ? body.harvestDate.toISOString() 
        : typeof body.harvestDate === 'string' 
          ? body.harvestDate 
          : new Date(body.harvestDate).toISOString()
    };

    const parsed = harvestSchema.safeParse(payload);

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
        harvestDate: new Date(harvestDate), // Convert ISO string to Date for Prisma
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { message: "Harvest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Harvest updated" });
  } catch (error) {
    console.error("[HARVEST_PATCH]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
