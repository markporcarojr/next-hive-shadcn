import { prisma } from "@/lib/prisma";
import { swarmTrapApiSchema } from "@/lib/schemas/swarmTrap";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET: /api/swarm
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
    const parsed = swarmTrapApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const swarmTrap = await prisma.swarmTrap.create({
      data: {
        ...data,
        installedAt: new Date(data.installedAt),
        removedAt: data.removedAt ? new Date(data.removedAt) : null,
        userId: user.id,
      },
    });

    return NextResponse.json(swarmTrap, { status: 201 });
  } catch (error) {
    console.error("[SWARM_POST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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

    const result = await prisma.swarmTrap.deleteMany({
      where: {
        id: Number(id),
        userId: user.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Swarm not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Swarm deleted" });
  } catch (error) {
    console.error("[SWARM_DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
