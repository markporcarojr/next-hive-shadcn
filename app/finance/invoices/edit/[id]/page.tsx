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
import { Separator } from "@/components/ui/separator";
import {
  InvoiceInput,
  InvoiceItemInput,
  invoiceFormSchema,
  invoiceApiSchema,
  PRODUCT_TYPES,
} from "@/lib/schemas/invoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EditInvoicePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InvoiceItemInput[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Omit<InvoiceInput, "items" | "total">>({
    resolver: zodResolver(invoiceFormSchema.omit({ items: true, total: true })),
    defaultValues: {
      customerName: "",
      date: new Date(),
      notes: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/finance/invoices/${id}`);
        if (!res.ok) throw new Error("Failed to fetch invoice");

        const data = await res.json();
        setItems(
          (data.items || []).map((i: InvoiceItemInput) => ({
            ...i,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice), // ✅ convert from string → number
          }))
        );

        form.reset({
          customerName: data.customerName,
          email: data.email ?? "",
          phone: data.phone ?? "",
          notes: data.notes ?? "",
          date: new Date(data.date),
        });
      } catch (err) {
        console.error("[FETCH_INVOICE_ERROR]", err);
        toast.error("Could not load invoice.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInvoice();
  }, [id, form]);

  const calculateTotal = (items: InvoiceItemInput[]) =>
    items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const updateItem = (index: number, updated: Partial<InvoiceItemInput>) => {
    setItems((prev) => {
      const copy = [...prev];
      // Ensure quantity and unitPrice are numbers
      const updatedWithNumbers = {
        ...updated,
        ...(updated.quantity !== undefined && {
          quantity: Number(updated.quantity),
        }),
        ...(updated.unitPrice !== undefined && {
          unitPrice: Number(updated.unitPrice),
        }),
      };
      copy[index] = { ...copy[index], ...updatedWithNumbers };
      return copy;
    });
  };

  const onSubmit = async (values: Omit<InvoiceInput, "items" | "total">) => {
    const fullData: InvoiceInput = {
      ...values,
      items,
      total: calculateTotal(items),
    };

    setSubmitting(true);
    try {
      const apiData = invoiceApiSchema.parse({
        ...fullData,
        date: fullData.date.toISOString(),
      });

      const res = await fetch(`/api/finance/invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify(apiData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message || "Failed to update invoice.");
        return;
      }
      toast.success("Invoice updated!");
      router.push("/finance/invoices");
    } catch (err) {
      console.error("[EDIT_INVOICE_SUBMIT]", err);
      toast.error("Unexpected error.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input type="email" {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DATE FIELD - THIS WAS MISSING! */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value ? format(field.value, "yyyy-MM-dd") : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : new Date();
                        field.onChange(date);
                      }}
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Items editing */}
            <Separator className="my-4" />
            <div className="font-semibold mb-2">Products</div>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <div className="flex-1">
                  <FormLabel>Product</FormLabel>
                  <Input
                    value={item.product}
                    onChange={(e) =>
                      updateItem(idx, { product: e.target.value })
                    }
                  />
                </div>
                <div className="w-24">
                  <FormLabel>Qty</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, { quantity: Number(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="w-32">
                  <FormLabel>Unit Price</FormLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unitPrice} // ✅ keep as number
                    onChange={(e) =>
                      updateItem(idx, {
                        unitPrice:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            ))}

            <div>
              <FormLabel>Total</FormLabel>
              <Input
                readOnly
                value={`$${calculateTotal(items).toFixed(2)}`}
                className="font-bold"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
