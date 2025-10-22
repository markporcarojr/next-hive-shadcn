import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { incomeApiSchema } from "@/lib/schemas/income";
import { prisma } from "@/lib/prisma";

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

    const income = await prisma.income.findFirst({
      where: { id: Number(id), userId: user.id },
    });

    if (!income)
      return NextResponse.json({ error: "Income not found" }, { status: 404 });

    return NextResponse.json(income);
  } catch (error) {
    console.error("[INCOME_ID_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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

    const body = await _req.json();
    const parsed = incomeApiSchema.partial().parse(body);

    // First check if income exists and belongs to user
    const existing = await prisma.income.findFirst({
      where: { id: Number(id), userId: user.id },
      select: { id: true },
    });

    if (!existing)
      return NextResponse.json({ error: "Income not found" }, { status: 404 });

    // Build update data with proper types
    const updateData: {
      source?: string;
      amount?: number;
      date?: Date;
      notes?: string;
      invoiceId?: number | null;
    } = {};

    if (parsed.source !== undefined) updateData.source = parsed.source;
    if (parsed.amount !== undefined) updateData.amount = parsed.amount;
    if (parsed.date !== undefined) updateData.date = parsed.date;
    if (parsed.notes !== undefined) updateData.notes = parsed.notes;
    if (parsed.invoiceId !== undefined) {
      updateData.invoiceId = parsed.invoiceId ? Number(parsed.invoiceId) : null;
    }

    const income = await prisma.income.update({
      where: { id: Number(id) },
      data: updateData,
    });
    return NextResponse.json(income);
  } catch (error) {
    console.error("[INCOME_ID_PATCH]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    // First check if income exists and belongs to user
    const existing = await prisma.income.findFirst({
      where: { id: Number(id), userId: user.id },
      select: { id: true },
    });

    if (!existing)
      return NextResponse.json({ error: "Income not found" }, { status: 404 });

    await prisma.income.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("[INCOME_ID_DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
