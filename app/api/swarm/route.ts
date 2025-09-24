import { prisma } from "@/lib/prisma";
import { swarmTrapSchema } from "@/lib/schemas/swarmTrap";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET: /api/swarm
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const swarms = await prisma.swarmTrap.findMany({
      where: { userId: user.id },
      orderBy: { installedAt: "desc" },
    });

    return NextResponse.json(swarms);
  } catch (error) {
    console.error("[SWARMS_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: /api/swarm
export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  
  // Ensure dates are in ISO format for validation
  const payload = {
    ...body,
    installedAt: body.installedAt instanceof Date 
      ? body.installedAt.toISOString() 
      : typeof body.installedAt === 'string' 
        ? body.installedAt 
        : new Date(body.installedAt).toISOString(),
    removedAt: body.removedAt 
      ? (body.removedAt instanceof Date 
          ? body.removedAt.toISOString() 
          : typeof body.removedAt === 'string' 
            ? body.removedAt 
            : new Date(body.removedAt).toISOString())
      : undefined
  };
  
  const parsed = swarmTrapSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const swarmTrap = await prisma.swarmTrap.create({
      data: {
        ...data,
        installedAt: new Date(data.installedAt), // Convert ISO string to Date for Prisma
        removedAt: data.removedAt ? new Date(data.removedAt) : null, // Convert ISO string to Date for Prisma
        userId: user.id,
      },
    });

    return NextResponse.json(swarmTrap, { status: 201 });
  } catch (error) {
    console.error("[SWARM_POST]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const result = await prisma.swarmTrap.deleteMany({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ message: "Swarm not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Swarm deleted" });
  } catch (error) {
    console.error("[SWARM_DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
