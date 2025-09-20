"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  InvoiceInput,
  InvoiceItemInput,
  PRODUCT_TYPES,
  PRODUCT_TYPE_VALUES,
  invoiceSchema,
} from "@/lib/schemas/invoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const PRICE_MAP: Record<(typeof PRODUCT_TYPE_VALUES)[number], number> = {
  honey: 8,
  "honey bulk": 30,
  "candles small": 5,
  "candles med": 10,
  "candles lg": 15,
  "morel candle $8": 8,
  "morel candle $10": 10,
  "honey bundle": 20,
  misc: 0,
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<InvoiceItemInput[]>([
    { product: "honey", quantity: 1, unitPrice: PRICE_MAP["honey"] },
  ]);

  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      date: new Date(),
      notes: "",
    },
  });
  const calculateTotal = (items: InvoiceItemInput[]) =>
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const updateItem = (index: number, updated: Partial<InvoiceItemInput>) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      return copy;
    });
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { product: "honey", quantity: 1, unitPrice: PRICE_MAP["honey"] },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: Omit<InvoiceInput, "items" | "total">) => {
    const values: InvoiceInput = {
      ...data,
      items,
      total: calculateTotal(items),
    };

    setLoading(true);
    try {
      const res = await fetch("/api/finance/invoices", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        router.push("/finance/invoices");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create invoice");
      }
    } catch (err) {
      console.error("[INVOICE_NEW]", err);
      alert("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8 p-8">
      <h3 className="text-2xl font-semibold mb-6">New Invoice</h3>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {/* Customer Info */}
          <div>
            <Label className="mb-3" htmlFor="customerName">
              Customer Name
            </Label>
            <Input
              id="customerName"
              placeholder="e.g. John Appleseed"
              {...form.register("customerName")}
            />
          </div>
          <div>
            <Label className="mb-3" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. john@example.com"
              {...form.register("email")}
            />
          </div>
          <div>
            <Label className="mb-3" htmlFor="phone">
              Phone
            </Label>
            <Input
              id="phone"
              placeholder="e.g. 5551234567"
              {...form.register("phone")}
            />
          </div>
          <div>
            <Label className="mb-3" htmlFor="date">
              Invoice Date
            </Label>
            <Input
              id="date"
              type="date"
              {...form.register("date", {
                setValueAs: (v) => (v ? new Date(v) : new Date()),
              })}
              defaultValue={format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          <div>
            <Label className="mb-3" htmlFor="notes">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Optional notes"
              {...form.register("notes")}
              rows={2}
            />
          </div>

          {/* Products */}
          <Separator className="my-4" />
          <div className="font-semibold mb-2">Products</div>

          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="mb-3">Product</Label>
                <Select
                  value={item.product}
                  onValueChange={(value) => {
                    const price =
                      PRICE_MAP[value as InvoiceItemInput["product"]] ?? 0;
                    updateItem(index, {
                      product: value as InvoiceItemInput["product"],
                      unitPrice: price,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Label className="mb-3">Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={Number(item.quantity)}
                  onChange={(e) =>
                    updateItem(index, {
                      quantity: Number(e.target.value) || 1,
                    })
                  }
                />
              </div>
              <div className="w-32">
                <Label className="mb-3">Unit Price</Label>
                <Input
                  type="number"
                  value={Number(item.unitPrice)}
                  onChange={(e) =>
                    updateItem(index, {
                      unitPrice: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeItem(index)}
                className="h-10"
              >
                Remove
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addItem}>
            + Add Item
          </Button>

          {/* Total */}
          <Separator className="my-4" />
          <div>
            <Label className="mb-3">Total</Label>
            <Input
              readOnly
              value={`$${calculateTotal(items).toFixed(2)}`}
              className="font-bold"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Invoice"}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
