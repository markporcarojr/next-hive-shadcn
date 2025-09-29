import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { incomeApiSchema } from "@/lib/schemas/income";
import { prisma } from "@/lib/prisma";

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

    const income = await prisma.income.findFirst({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    if (!income)
      return NextResponse.json({ error: "Income not found" }, { status: 404 });

    return NextResponse.json(income);
  } catch (error) {
    console.error("[INCOME_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch income" },
      { status: 500 }
    );
  }
}

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
      date: new Date(body.date),
    };

    const parsed = incomeApiSchema.safeParse(convertedBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await prisma.income.update({
      where: { id: Number(resolvedParams.id), userId: user.id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[INCOME_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update income" },
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

    await prisma.income.delete({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[INCOME_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete income" },
      { status: 500 }
    );
  }
}
