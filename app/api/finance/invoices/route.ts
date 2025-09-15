import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/schemas/invoice";
import { sendInvoiceEmail } from "@/lib/sendInvoiceEmail";
import { auth } from "@clerk/nextjs/server";
import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const parse = invoiceSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parse.error.format() },
        { status: 400 }
      );
    }

    const data = parse.data;

    const invoice = await prisma.invoice.create({
      data: {
        customerName: data.customerName,
        date: new Date(data.date),
        email: data.email,
        phone: data.phone,
        notes: data.notes,
        total: new Decimal(data.total),
        user: {
          connect: {
            // assumes you're using your own User table and linking via Clerk ID
            clerkId: userId,
          },
        },
        items: {
          create: data.items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
          })),
        },
      },
    });

    if (invoice.email) {
      await sendInvoiceEmail({
        to: invoice.email,
        customerName: invoice.customerName,
        total: invoice.total.toNumber(),
        date: invoice.date.toISOString().slice(0, 10),
        description: invoice.notes ?? undefined,
        items: data.items.map(
          (item) =>
            `${item.quantity}x ${item.product} @ $${item.unitPrice.toFixed(2)}`
        ),
      });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error("[INVOICE_POST_ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[INVOICE_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
