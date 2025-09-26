import { prisma } from "@/lib/prisma";
import { invoiceApiSchema } from "@/lib/schemas/invoice";
import { sendInvoiceEmail } from "@/lib/sendInvoiceEmail";
import { auth } from "@clerk/nextjs/server";
import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const parse = invoiceApiSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parse.error.format() },
        { status: 400 }
      );
    }

    const data = parse.data;

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // First, verify the invoice belongs to the user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: Number(params.id),
        userId: user.id,
      },
      include: { items: true },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Update the invoice with transaction to handle items
    const updated = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: Number(params.id) },
      });

      // Update invoice with new data
      const updatedInvoice = await tx.invoice.update({
        where: { id: Number(params.id) },
        data: {
          customerName: data.customerName,
          date: new Date(data.date),
          email: data.email,
          phone: data.phone,
          notes: data.notes,
          total: new Decimal(data.total),
          items: {
            create: data.items.map((item) => ({
              product: item.product,
              quantity: item.quantity,
              unitPrice: new Decimal(item.unitPrice),
            })),
          },
        },
        include: { items: true },
      });

      return updatedInvoice;
    });

    // Send email if email is provided (optional for updates)
    if (updated.email) {
      await sendInvoiceEmail({
        to: updated.email,
        customerName: updated.customerName,
        total: updated.total.toNumber(),
        date: updated.date.toISOString().slice(0, 10),
        description: updated.notes ?? undefined,
        items: data.items.map(
          (item) =>
            `${item.quantity}x ${item.product} @ $${item.unitPrice.toFixed(2)}`
        ),
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[INVOICE_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.invoice.delete({
      where: { id: Number(params.id), userId: user.id },
      include: { items: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[INVOICE_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
