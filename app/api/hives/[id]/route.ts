import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { hiveApiSchema } from "@/lib/schemas/hive";

// GET /api/hives/[id]
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const hive = await prisma.hive.findFirst({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    if (!hive)
      return NextResponse.json({ error: "Hive not found" }, { status: 404 });

    return NextResponse.json(hive);
  } catch (error) {
    console.error("[HIVE_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch hive" },
      { status: 500 }
    );
  }
}

// PATCH /api/hives/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    const convertedBody = {
      ...body,
      hiveDate: new Date(body.hiveDate),
    };

    const parsed = hiveApiSchema.safeParse(convertedBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const hive = await prisma.hive.update({
      where: { id: Number(resolvedParams.id), userId: user.id },
      data: parsed.data,
    });

    return NextResponse.json(hive);
  } catch (error) {
    console.error("[HIVE_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update hive" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const hive = await prisma.hive.deleteMany({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    if (hive.count === 0)
      return NextResponse.json({ error: "Hive not found" }, { status: 404 });

    return NextResponse.json({ message: "Hive deleted successfully" });
  } catch (error) {
    console.error("[HIVE_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete hive" },
      { status: 500 }
    );
  }
}
