"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  InvoiceInput,
  InvoiceItemInput,
  PRODUCT_TYPES,
  PRODUCT_TYPE_VALUES,
  invoiceFormSchema,
} from "@/lib/schemas/invoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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

  const form = useForm<Omit<InvoiceInput, "items" | "total">>({
    resolver: zodResolver(invoiceFormSchema.omit({ items: true, total: true })),
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
    const total = calculateTotal(items);
    const values: InvoiceInput = {
      ...data,
      items,
      total,
    };

    setLoading(true);
    try {
      // Create the invoice
      const invoiceRes = await fetch("/api/finance/invoices", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!invoiceRes.ok) {
        const error = await invoiceRes.json();
        toast.error(error.error || "Failed to create invoice");
        setLoading(false);
        return;
      }

      // Create the corresponding income record
      const incomeRes = await fetch("/api/finance/income", {
        method: "POST",
        body: JSON.stringify({
          source: `Invoice - ${data.customerName}`,
          amount: total,
          date: data.date,
          notes: `Auto-generated from invoice. ${data.notes || ""}`.trim(),
        }),
      });

      if (!incomeRes.ok) {
        // Invoice was created but income failed
        console.error("Failed to create income record");
        toast.warning("Invoice created, but income record failed");
      } else {
        toast.success("Invoice and income record created successfully!");
      }

      router.push("/finance/invoices");
    } catch (err) {
      console.error("[INVOICE_NEW]", err);
      toast.error("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create New Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Info */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. John Appleseed"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="e.g. john@example.com"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 5551234567"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      disabled={loading}
                      value={
                        new Date(field.value as string | number | Date)
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : new Date()
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes"
                      {...field}
                      disabled={loading}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Products */}
            <Separator className="my-4" />
            <div className="font-semibold mb-2">Products</div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <FormLabel>Product</FormLabel>
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
                  <FormLabel>Qty</FormLabel>
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
                  <FormLabel>Unit Price</FormLabel>
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
              <FormLabel>Total</FormLabel>
              <Input
                readOnly
                value={`$${calculateTotal(items).toFixed(2)}`}
                className="font-bold"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Invoice"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/finance/invoices")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
