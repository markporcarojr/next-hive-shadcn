"use client";

import { HiveInput, hiveSchema } from "@/lib/schemas/hive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { IconEdit, IconCalendar } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function EditHivesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<HiveInput>({
    resolver: zodResolver(hiveSchema),
    defaultValues: {
      hiveNumber: 0,
      hiveSource: "",
      hiveDate: new Date(),
      queenColor: "",
      broodBoxes: 0,
      superBoxes: 0,
      todo: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/hives");
        const data = await res.json();
        const current = data.find((h: { id: number }) => h.id === Number(params.id));
        if (!current) return router.push("/hives");

        form.reset({
          hiveNumber: current.hiveNumber,
          hiveSource: current.hiveSource,
          hiveDate: new Date(current.hiveDate),
          queenColor: current.queenColor || "",
          broodBoxes: current.broodBoxes || 0,
          superBoxes: current.superBoxes || 0,
          todo: current.todo || "",
        });
      } catch (e: unknown) {
        toast.error("Failed to load data");
        router.push("/hives");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, form, router]);

  const handleSubmit = async (values: HiveInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hives/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          hiveDate: new Date(values.hiveDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Could not update hive");
      } else {
        toast.success(`Hive #${values.hiveNumber} was updated successfully`);
        router.push("/hives");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Edit Hive</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="hiveDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Hive Date</FormLabel>
                <Popover>
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
                        <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hiveNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hive Number</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hiveSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hive Source</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hive source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Nucleus">Nucleus</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                    <SelectItem value="Capture Swarm">Capture Swarm</SelectItem>
                    <SelectItem value="Split">Split</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="queenColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Queen Color</FormLabel>
                <FormControl>
                  <Input placeholder="Queen color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="broodBoxes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brood Boxes</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="superBoxes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Super Boxes</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="todo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To-do</FormLabel>
                <FormControl>
                  <Textarea placeholder="Notes or tasks for this hive" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              <IconEdit className="mr-2 h-4 w-4" />
              {loading ? "Updating..." : "Update Hive"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
