// app/finance/invoices/[id]/page.tsx

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PRODUCT_TYPES } from "@/lib/schemas/invoice";
import { format } from "date-fns";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params; // ✅ must await

  const { userId: clerkId } = await auth();
  if (!clerkId) return notFound();

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return notFound();

  const invoice = await prisma.invoice.findFirst({
    where: { id: Number(id), userId: user.id },
    include: { items: true },
  });
  if (!invoice) return notFound();

  // Ensure numbers are plain JS numbers
  const safeInvoice = {
    ...invoice,
    total:
      typeof invoice.total === "number" ? invoice.total : Number(invoice.total),
    items: invoice.items.map((item) => ({
      ...item,
      unitPrice:
        typeof item.unitPrice === "number"
          ? item.unitPrice
          : Number(item.unitPrice),
    })),
  };

  const calculateTotal = () =>
    safeInvoice.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

  return (
    <Card className="max-w-2xl mx-auto mt-8 p-8">
      <h3 className="text-2xl font-semibold mb-6">Invoice</h3>

      <div className="space-y-4">
        {/* Customer Info */}
        <div>
          <Label>Customer Name</Label>
          <Input readOnly value={safeInvoice.customerName} />
        </div>
        <div>
          <Label>Email</Label>
          <Input readOnly value={safeInvoice.email ?? ""} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input readOnly value={safeInvoice.phone ?? ""} />
        </div>
        <div>
          <Label>Invoice Date</Label>
          <Input
            readOnly
            value={format(new Date(safeInvoice.date), "yyyy-MM-dd")}
          />
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea readOnly value={safeInvoice.notes || ""} rows={2} />
        </div>

        {/* Products */}
        <Separator className="my-4" />
        <div className="font-semibold mb-2">Products</div>

        {safeInvoice.items.map((item, index) => {
          const label =
            PRODUCT_TYPES.find((t) => t.value === item.product)?.label ||
            item.product;
          return (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label>Product</Label>
                <Input readOnly value={label} />
              </div>
              <div className="w-24">
                <Label>Qty</Label>
                <Input readOnly value={item.quantity.toString()} />
              </div>
              <div className="w-32">
                <Label>Unit Price</Label>
                <Input readOnly value={`$${item.unitPrice.toFixed(2)}`} />
              </div>
            </div>
          );
        })}

        {/* Total */}
        <Separator className="my-4" />
        <div>
          <Label>Total</Label>
          <Input
            readOnly
            value={`$${calculateTotal().toFixed(2)}`}
            className="font-bold"
          />
        </div>
      </div>
    </Card>
  );
}
