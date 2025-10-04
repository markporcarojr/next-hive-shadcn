// app/finance/invoices/[id]/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { InvoiceInput, PRODUCT_TYPES } from "@/lib/schemas/invoice";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

async function fetchInvoice(id: string): Promise<InvoiceInput> {
  const res = await fetch(`/api/finance/invoices/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch invoice");
  }
  return res.json();
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      if (!params.id || typeof params.id !== "string") return;

      try {
        setLoading(true);
        const data = await fetchInvoice(params.id);
        setInvoice(data);
        setError(null);
      } catch (err) {
        console.error("Error loading invoice:", err);
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    }
    loadInvoice();
  }, [params.id]);

  const calculateTotal = () =>
    invoice?.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    ) ?? 0;

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto mb-8 p-8">
        <p>Loading invoice...</p>
      </Card>
    );
  }

  if (error || !invoice) {
    return (
      <Card className="max-w-2xl mx-auto mb-8 p-8">
        <p className="text-destructive">{error || "Invoice not found"}</p>
        <Button
          onClick={() => router.push("/finance/invoices")}
          className="mt-4"
        >
          Back to Invoices
        </Button>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto mb-8 p-8">
      <h3 className="text-2xl font-semibold mb-6">Invoice</h3>

      <div className="space-y-4">
        {/* Customer Info */}
        <div>
          <Label>Customer Name</Label>
          <Input readOnly value={invoice.customerName} />
        </div>
        <div>
          <Label>Email</Label>
          <Input readOnly value={invoice.email ?? ""} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input readOnly value={invoice.phone ?? ""} />
        </div>
        <div>
          <Label>Invoice Date</Label>
          <Input
            readOnly
            value={
              invoice.date ? format(new Date(invoice.date), "yyyy-MM-dd") : ""
            }
          />
        </div>
        <div>
          <Label>Notes</Label>
          <Textarea readOnly value={invoice.notes || ""} rows={2} />
        </div>

        {/* Products */}
        <Separator className="my-4" />
        <div className="font-semibold mb-2">Products</div>

        {invoice.items.map((item, index) => {
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
                <Input
                  readOnly
                  value={`$${Number(item.unitPrice).toFixed(2)}`}
                />
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
        <div className="flex gap-2 mt-4">
          <Button onClick={() => router.push("/finance/invoices")}>Back</Button>
        </div>
      </div>
    </Card>
  );
}
