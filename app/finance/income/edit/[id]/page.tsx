"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IncomeInput, incomeFormSchema } from "@/lib/schemas/income";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DetailPageSkeleton } from "@/components/detail-page-skeleton";

export default function EditIncomePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const form = useForm<IncomeInput>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      source: "",
      amount: 0,
      date: new Date(),
    },
  });

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await fetch(`/api/finance/income/${id}`);
        if (!res.ok) {
          toast.error("Failed to load income record.");
          return;
        }
        const data = await res.json();

        const formData = {
          source: data.source || "",
          amount: Number(data.amount) || 0,
          date: data.date ? new Date(data.date) : new Date(),
        };

        form.reset(formData);
      } catch {
        console.error("[INCOME_EDIT] Failed to fetch income");
        toast.error("Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIncome();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, form.reset]);

  const onSubmit = async (values: IncomeInput) => {
    try {
      const res = await fetch(`/api/finance/income/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        toast.error("Failed to update income record.");
        return;
      }
      toast.success("Income record updated successfully.");
      router.push("/finance/income");
    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error(err);
    }
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h3 className="text-2xl font-semibold mb-4">Edit Income</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <FormControl>
                  <Input placeholder="Sold honey or candles..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step={0.01}
                    min={0}
                    {...field}
                    value={
                      field.value !== undefined && field.value !== null
                        ? String(field.value)
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
          <div className="flex justify-between">
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={form.formState.isSubmitting}
            >
              Update Income
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
