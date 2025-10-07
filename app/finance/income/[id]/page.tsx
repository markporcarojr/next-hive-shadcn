"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IncomeInput, incomeFormSchema } from "@/lib/schemas/income";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

async function fetchIncome(id: string): Promise<IncomeInput> {
  const res = await fetch(`/api/finance/income/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch income");
  }
  return res.json();
}

export default function IncomeReadOnlyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const form = useForm<IncomeInput>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      source: "",
      amount: 0,
      date: new Date(),
      notes: "",
    },
  });

  useEffect(() => {
    async function loadIncome() {
      const data = await fetchIncome(id);
      form.reset(data);
    }
    loadIncome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Income Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Source */}
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Input {...field} disabled />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ($)</FormLabel>
                    <Input type="number" {...field} disabled />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      value={
                        new Date(field.value as string | number | Date)
                          .toISOString()
                          .split("T")[0]
                      }
                      disabled
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <Input {...field} disabled />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button onClick={() => router.push("/finance/income")}>
                  Back
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
