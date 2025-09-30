"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  InvoiceInput,
  invoiceApiSchema,
  invoiceFormSchema,
} from "@/lib/schemas/invoice";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [open, setOpen] = useState(false);

  const form = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceFormSchema), // Temporary cast to bypass type error if schema is not fixed
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
        const res = await fetch(`/api/finance/invoices/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch invoice");
        }
        const data = await res.json();
        const formData = {
          customerName: data.customerName || "",
          total: Number(data.total) || 0,
          date: data.date ? new Date(data.date) : new Date(),
          notes: data.notes || "",
        };

        form.reset(formData);
      } catch (error) {
        console.error("[FETCH_INVOICE_ERROR]", error);
        toast.error("Something went wrong while fetching the invoice.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values: InvoiceInput) => {
    setSubmitting(true);
    try {
      const apiData = invoiceApiSchema.parse({
        ...values,
        date: values.date.toISOString(),
      });
      const res = await fetch(`/api/finance/invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify(apiData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(
          error.message || "Something went wrong while saving the invoice."
        );
        return;
      }
      toast.success("Invoice updated successfully!");
      router.push("/finance");
    } catch (err) {
      toast.error("Something went wrong while saving the invoice.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

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
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date ?? new Date());
                          setOpen(false);
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
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
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
