// app/api/finance/invoices/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: { id: Number(id), userId: user.id },
      include: {
        items: {
          select: {
            id: true,
            product: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[GET_INVOICE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await _req.json();

    // Verify ownership before updating
    const existing = await prisma.invoice.findFirst({
      where: { id: Number(id), userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoice = await prisma.invoice.update({
      where: { id: Number(id) },
      data: {
        customerName: body.customerName,
        total: body.total,
        date: body.date ? new Date(body.date) : undefined,
        notes: body.notes,
        email: body.email,
        phone: body.phone,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[PATCH_INVOICE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    // Verify ownership before deleting
    const existing = await prisma.invoice.findFirst({
      where: { id: Number(id), userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await prisma.invoice.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Invoice deleted" });
  } catch (error) {
    console.error("[DELETE_INVOICE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


