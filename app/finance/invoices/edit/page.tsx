"use client";

import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceInput, invoiceSchema } from "@/lib/schemas/invoice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema), // Temporary cast to bypass type error if schema is not fixed
    defaultValues: {
      customerName: "",
      total: 0,
      date: new Date(),
      notes: "",
    },
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoice/${id}`);
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const data = await res.json();
        // Convert date to yyyy-mm-dd string if needed
        form.reset({
          ...data,
          date:
            typeof data.date === "string"
              ? data.date.slice(0, 10)
              : data.date instanceof Date
                ? data.date.toISOString().slice(0, 10)
                : "",
        });
      } catch {
        setError("Failed to load invoice record.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values: InvoiceInput) => {
    try {
      const res = await fetch(`/api/finance/invoice/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...values,
          date: new Date(values.date as string),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update invoice");
      router.push("/finance");
    } catch (err) {
      setError("Something went wrong while saving.");
      console.error(err);
    }
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      value={
                        field.value !== undefined && field.value !== null
                          ? Number(field.value)
                          : ""
                      }
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        typeof field.value === "string"
                          ? field.value
                          : field.value instanceof Date
                            ? field.value.toISOString().slice(0, 10)
                            : ""
                      }
                      onChange={(e) => field.onChange(e.target.value)}
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
            <Button type="submit" className="w-full mt-2">
              Update Invoice
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
