import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { hiveApiSchema } from "@/lib/schemas/hive";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const hives = await prisma.hive.findMany({
      where: { userId: user.id },
      orderBy: { hiveDate: "desc" },
    });

    return NextResponse.json(hives);
  } catch (error) {
    console.error("[HIVE_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const convertedBody = {
      ...body,
      hiveDate: new Date(body.hiveDate), // Convert date string to Date object
    };
    const parsed = hiveApiSchema.safeParse(convertedBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existingHive = await prisma.hive.findFirst({
      where: {
        hiveNumber: data.hiveNumber,
        userId: user.id,
      },
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

    return NextResponse.json(hive);
  } catch (error) {
    console.error("[HIVE_POST]", error);
    return NextResponse.json(
      { error: "Failed to create hive" },
      { status: 500 }
    );
  }
}
