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
import { HarvestInput, harvestFormSchema } from "@/lib/schemas/harvest";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, use } from "react";
import { useForm } from "react-hook-form";

async function fetchHarvest(id: string): Promise<HarvestInput> {
  const res = await fetch(`/api/harvest/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch harvest");
  }
  return res.json();
}

export default function HarvestReadOnlyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const form = useForm<HarvestInput>({
    resolver: zodResolver(harvestFormSchema),
    defaultValues: {
      harvestType: "",
      harvestAmount: 0,
      harvestDate: new Date(),
    },
  });

  useEffect(() => {
    async function loadHarvest() {
      const data = await fetchHarvest(id);
      form.reset(data);
    }
    loadHarvest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Harvest Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Harvest Type */}
              <FormField
                control={form.control}
                name="harvestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harvest Type</FormLabel>
                    <Input {...field} disabled />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Harvest Amount */}
              <FormField
                control={form.control}
                name="harvestAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harvest Amount (lbs)</FormLabel>
                    <Input type="number" {...field} disabled />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Harvest Date */}
              <FormField
                control={form.control}
                name="harvestDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? new Date(field.value as string | number | Date)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      disabled
                      onChange={() => {}}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button type="button" onClick={() => router.push("/harvest")}>
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
