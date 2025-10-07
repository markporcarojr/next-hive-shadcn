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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HarvestInput, harvestFormSchema } from "@/lib/schemas/harvest";
// Ensure in harvestFormSchema, harvestDate is defined as z.date()
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Harvest } from "@prisma/client";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditHarvestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const form = useForm<HarvestInput>({
    resolver: zodResolver(harvestFormSchema),
    defaultValues: {
      harvestAmount: 0,
      harvestType: "",
      harvestDate: new Date(),
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/harvest");
        const data = await res.json();
        const current = data.find((h: Harvest) => h.id === Number(id));
        if (!current) return router.push("/harvest");

        form.reset({
          harvestAmount: current.harvestAmount,
          harvestType: current.harvestType,
          harvestDate: new Date(current.harvestDate),
        });
      } catch {
        toast.error("Failed to load harvest");
        router.push("/harvest");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (values: HarvestInput) => {
    try {
      const res = await fetch(`/api/harvest?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          harvestDate: values.harvestDate.toISOString(),
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        toast.error(result.message || "Failed to update harvest");
        return;
      }

      toast.success("Harvest updated successfully");
      router.push("/harvest");
    } catch {
      toast.error("Failed to update harvest");
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div className="flex justify-center mt-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Harvest</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="harvestAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harvest Amount (lbs)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        min={0}
                        step={0.01}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="harvestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harvest Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick one" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Honey">Honey</SelectItem>
                        <SelectItem value="Wax">Wax</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="harvestDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value as Date, "PPP")
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
                          selected={field.value as Date | undefined}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button type="submit">Update</Button>
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
        </CardContent>
      </Card>
    </div>
  );
}
