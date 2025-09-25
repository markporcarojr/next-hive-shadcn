import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { hiveApiSchema } from "@/lib/schemas/hive";

// GET /api/hives/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  try {
    const hive = await prisma.hive.findUnique({
      where: { id: Number(resolvedParams.id) },
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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const convertedBody = {
    ...body,
    hiveDate: new Date(body.hiveDate),
  };
  const parsed = hiveApiSchema.safeParse(convertedBody);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const hive = await prisma.hive.update({
      where: { id: Number(resolvedParams.id) },
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
