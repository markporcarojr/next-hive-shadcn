import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/schemas/expense";

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
      
    // Ensure date is in ISO format for validation
    const payload = {
      ...body,
      date: body.date instanceof Date 
        ? body.date.toISOString() 
        : typeof body.date === 'string' 
          ? body.date 
          : new Date(body.date).toISOString()
    };

    const parsed = expenseSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = await prisma.expense.update({
      where: { id: Number(resolvedParams.id), userId: user.id },
      data: {
        ...parsed.data,
        date: new Date(parsed.data.date), // Convert ISO string to Date for Prisma
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[EXPENSE_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
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

    await prisma.expense.delete({
      where: { id: Number(resolvedParams.id), userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[EXPENSE_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
