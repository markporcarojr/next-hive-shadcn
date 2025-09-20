"use client";

import { HarvestInput, harvestSchema } from "@/lib/schemas/harvest";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { IconCalendar, IconPlus } from "@tabler/icons-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function CreateHarvestPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<HarvestInput>({
    resolver: zodResolver(harvestSchema),
    defaultValues: {
      harvestAmount: 0,
      harvestType: "",
      harvestDate: new Date(),
    },
  });

  // Keep react-hook-form in sync with date picker
  const watchedDate = watch("harvestDate");
  // If date changes, update form value
  if (date && watchedDate !== date) setValue("harvestDate", date);

  const onSubmit = async (values: HarvestInput) => {
    try {
      const res = await fetch("/api/harvest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          harvestDate: values.harvestDate.toISOString(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Something went wrong");
        return;
      }

      toast.success("Harvest added!");

      reset();
      router.push("/harvest");
    } catch (error) {
      console.error(error);
      toast.error("Could not save harvest. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Add New Harvest</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="harvestAmount">Harvest Amount (lbs)</Label>
          <Input
            id="harvestAmount"
            type="number"
            step="any"
            {...register("harvestAmount", { valueAsNumber: true })}
          />
          {errors.harvestAmount && (
            <p className="text-sm text-red-600 mt-1">
              {errors.harvestAmount.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="harvestType">Harvest Type</Label>
          <Select
            onValueChange={(value) => setValue("harvestType", value)}
            defaultValue=""
          >
            <SelectTrigger id="harvestType">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Honey">Honey</SelectItem>
              <SelectItem value="Wax">Wax</SelectItem>
            </SelectContent>
          </Select>
          {errors.harvestType && (
            <p className="text-sm text-red-600 mt-1">
              {errors.harvestType.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="harvestDate">Harvest Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                type="button"
              >
                <IconCalendar className="mr-2 h-4 w-4" />
                {date ? format(date, "MM-dd-yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selected) => {
                  setDate(selected as Date);
                  setValue("harvestDate", selected as Date);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.harvestDate && (
            <p className="text-sm text-red-600 mt-1">
              {errors.harvestDate.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            <IconPlus className="mr-2 h-4 w-4" />
            Add Harvest
          </Button>
        </div>
      </form>
    </div>
  );
}
