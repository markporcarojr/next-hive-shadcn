import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { incomeSchema } from "@/lib/schemas/income";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const incomes = await prisma.income.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(incomes);
  } catch (error) {
    console.error("[INCOME_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = incomeSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const income = await prisma.income.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error("[INCOME_POST]", error);
    return NextResponse.json(
      { error: "Failed to create income" },
      { status: 500 }
    );
  }
}
