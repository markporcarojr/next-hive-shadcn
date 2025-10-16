import { prisma } from "@/lib/prisma";
import { invoiceApiSchema } from "@/lib/schemas/invoice";
import { sendInvoiceEmail } from "@/lib/sendInvoiceEmail";
import { auth } from "@clerk/nextjs/server";
import { Decimal } from "@prisma/client/runtime/library";
import { NextResponse } from "next/server";

export async function POST(_req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // find user by clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // parse body
    const body = await _req.json();
    const parse = invoiceApiSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parse.error.format() },
        { status: 400 }
      );
    }
    const data = parse.data;

    // create invoice
    const invoice = await prisma.invoice.create({
      data: {
        customerName: data.customerName,
        date: new Date(data.date),
        email: data.email,
        phone: data.phone,
        notes: data.notes,
        total: new Decimal(data.total),
        userId: user.id,
        items: {
          create: data.items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            unitPrice: new Decimal(item.unitPrice),
          })),
        },
      },
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

    // send email safely with proper invoice structure
    if (invoice.email) {
      try {
        await sendInvoiceEmail({
          to: invoice.email,
          invoiceNumber: invoice.id,
          customerName: invoice.customerName,
          total: invoice.total.toNumber(),
          date: invoice.date.toISOString(),
          email: invoice.email,
          phone: invoice.phone || undefined,
          notes: invoice.notes || undefined,
          items: invoice.items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toNumber(),
          })),
        });
      } catch (err) {
        console.error("[EMAIL_ERROR]", err);
        // don't fail invoice creation if email send fails
      }
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error("[INVOICE_POST_ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
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
      orderBy: { date: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[INVOICE_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
