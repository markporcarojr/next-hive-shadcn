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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HarvestInput, harvestSchema } from "@/lib/schemas/harvest";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { IconCalendar, IconPlus } from "@tabler/icons-react";
import z from "zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CreateHarvestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof harvestSchema>>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      harvestAmount: 0,
      harvestType: "",
      harvestDate: new Date(),
    },
  });

  const onSubmit = async (values: HarvestInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/harvest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
        }),
      });

      if (res.ok) {
        toast.success("Harvest added successfully!");
        router.push("/harvest");
      } else {
        const error = await res.json();
        toast.error(error.error || "Something went wrong.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Add New Harvest</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Harvest Amount */}
            <FormField
              control={form.control}
              name="harvestAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvest Amount (lbs)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      placeholder="Amount"
                      disabled={loading}
                      {...field}
                      value={
                        typeof field.value === "number" && !isNaN(field.value)
                          ? field.value
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Harvest Type */}
            <FormField
              control={form.control}
              name="harvestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvest Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pick one" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Honey">Honey</SelectItem>
                        <SelectItem value="Wax">Wax</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Harvest Date */}
            {/* Harvest Date */}
            <FormField
              control={form.control}
              name="harvestDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Harvest Date</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          type="button"
                          disabled={loading}
                        >
                          <IconCalendar className="mr-2 h-4 w-4" />
                          {field.value instanceof Date
                            ? format(field.value, "MM-dd-yyyy")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={
                            field.value instanceof Date
                              ? field.value
                              : new Date()
                          }
                          onSelect={(d) => {
                            if (d) field.onChange(d); // <-- always Date
                          }}
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              <IconPlus className="mr-2 h-4 w-4" />
              {loading ? "Adding..." : "Add Harvest"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
