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
import { IncomeInput, incomeSchema } from "@/lib/schemas/income";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function EditIncomePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const form = useForm<IncomeInput>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      source: "",
      amount: 0,
      date: "",
    },
  });

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await fetch(`/api/finance/income/${id}`);
        if (!res.ok) throw new Error("Failed to fetch income");
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
        setError("Failed to load income record.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSubmit = async (values: IncomeInput) => {
    try {
      const res = await fetch(`/api/finance/income/${id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update income");
      router.push("/finance/income");
    } catch (err) {
      setError("Something went wrong while saving.");
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

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
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      field.value !== undefined && field.value !== null
                        ? String(field.value)
                        : ""
                    }
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={form.formState.isSubmitting}
          >
            Update Income
          </Button>
        </form>
      </Form>
    </div>
  );
}
