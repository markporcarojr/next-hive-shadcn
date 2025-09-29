import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { harvestApiSchema } from "@/lib/schemas/harvest";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

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

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const convertedBody = {
      ...body,
      harvestDate: new Date(body.harvestDate), // Convert date string to Date object
    };
    const parsed = harvestApiSchema.safeParse(convertedBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const harvest = await prisma.harvest.create({
      data: {
        ...parsed.data,
        userId: user.id,
      },
    });

    return NextResponse.json(harvest);
  } catch (error) {
    console.error("[HARVEST_POST]", error);
    return NextResponse.json(
      { error: "Failed to create harvest" },
      { status: 500 }
    );
  }
}
