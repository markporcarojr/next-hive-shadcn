import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { hiveApiSchema } from "@/lib/schemas/hive";

// GET /api/hives/[id]
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hive = await prisma.hive.findUnique({
      where: { id: Number(id) },
    });

    if (!hive) {
      return NextResponse.json({ message: "Hive not found" }, { status: 404 });
    }

    return NextResponse.json(hive);
  } catch (error) {
    console.error("[HIVE_GET_BY_ID]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// PATCH /api/hives/[id]
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await _req.json();

  const parsed = hiveApiSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const hive = await prisma.hive.update({
      where: { id: Number(id) },
      data: {
        ...parsed.data,
      },
    });

    return NextResponse.json(hive);
  } catch (error) {
    console.error("[HIVE_PATCH_BY_ID]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
