import { prisma } from "@/lib/prisma";
import { swarmTrapApiSchema } from "@/lib/schemas/swarmTrap";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET: /api/swarm/[id]
export async function GET(
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
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const swarm = await prisma.swarmTrap.findFirst({
      where: { id: Number(id), userId: user.id },
    });

    if (!swarm) {
      return NextResponse.json({ error: "Swarm not found" }, { status: 404 });
    }

    return NextResponse.json(swarm);
  } catch (error) {
    console.error("[SWARM_GET_BY_ID]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH: /api/swarm/[id]
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
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verify ownership before updating
    const existing = await prisma.swarmTrap.findFirst({
      where: { id: Number(id), userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Swarm not found" }, { status: 404 });
    }

    const body = await _req.json();
    const parsedData = swarmTrapApiSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { errors: parsedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedSwarm = await prisma.swarmTrap.update({
      where: { id: Number(id) },
      data: parsedData.data,
    });

    return NextResponse.json(updatedSwarm);
  } catch (error) {
    console.error("[SWARM_PATCH_BY_ID]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
