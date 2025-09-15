import { prisma } from "@/lib/prisma";
import { swarmTrapSchema } from "@/lib/schemas/swarmTrap";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET: /api/swarm/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const swarm = await prisma.swarmTrap.findUnique({
      where: { id: Number(params.id), userId: user.id },
    });

    if (!swarm) {
      return NextResponse.json({ error: "Swarm not found" }, { status: 404 });
    }

    return NextResponse.json(swarm);
  } catch (error) {
    console.error("[SWARM_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH: /api/swarm?id=123
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const parsedData = swarmTrapSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: parsedData.error.errors },
        { status: 400 }
      );
    }

    const updatedSwarm = await prisma.swarmTrap.update({
      where: { id: Number(params.id), userId: user.id },
      data: parsedData.data,
    });

    return NextResponse.json(updatedSwarm, { status: 200 });
  } catch (error) {
    console.error("[SWARM_PATCH]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
