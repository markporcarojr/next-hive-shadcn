import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { incomeSchema } from "@/lib/schemas/income";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
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

    const income = await prisma.income.findUnique({
      where: { id: Number(resolvedParams.id), userId: user.id },
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
  req: NextRequest,
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

    const body = await req.json();
    
    // Ensure date is in ISO format for validation if present
    const payload = body.date ? {
      ...body,
      date: body.date instanceof Date 
        ? body.date.toISOString() 
        : typeof body.date === 'string' 
          ? body.date 
          : new Date(body.date).toISOString()
    } : body;
    
    const data = incomeSchema.partial().parse(payload);
    
    // Convert date back to Date object for Prisma if present
    const prismaData = data.date ? {
      ...data,
      date: new Date(data.date)
    } : data;

    const updated = await prisma.income.updateMany({
      where: { id: Number(resolvedParams.id), userId: user.id },
      data: prismaData,
    });

    if (updated.count === 0)
      return NextResponse.json(
        { error: "Income not found or not yours" },
        { status: 404 }
      );

    const income = await prisma.income.findUnique({
      where: { id: Number(resolvedParams.id) },
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
  const resolvedParams = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const deleted = await prisma.income.deleteMany({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    if (deleted.count === 0)
      return NextResponse.json(
        { error: "Income not found or not yours" },
        { status: 404 }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[INCOME_ID_DELETE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
