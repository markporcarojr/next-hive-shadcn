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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HiveInput, hiveFormSchema } from "@/lib/schemas/hive";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function EditHivesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const form = useForm<HiveInput>({
    resolver: zodResolver(hiveFormSchema),
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
        const res = await fetch(`/api/hives/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch data");

        form.reset({
          hiveNumber: data.hiveNumber,
          hiveSource: data.hiveSource,
          hiveDate: new Date(data.hiveDate),
          queenColor: data.queenColor || "",
          broodBoxes: data.broodBoxes || 0,
          superBoxes: data.superBoxes || 0,
          todo: data.todo || "",
        });
      } catch {
        toast.error("Failed to load data");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form, router]);

  const handleSubmit = async (values: HiveInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hives/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Could not update hive.");
      } else {
        toast.success(`Hive #${values.hiveNumber} was updated successfully.`);
        router.push("/hives");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent>
            <div className="flex justify-center p-8">Loading...</div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Hive</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Hive Date */}
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
                              // display string value as a formatted date
                              format(new Date(field.value), "PPP")
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
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date ? date.toISOString() : "")
                          }
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

              {/* Hive Number */}
              <FormField
                control={form.control}
                name="hiveNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hive Number *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hive Source */}
              <FormField
                control={form.control}
                name="hiveSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hive Source *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nucleus">Nucleus</SelectItem>
                        <SelectItem value="Package">Package</SelectItem>
                        <SelectItem value="Capture Swarm">
                          Capture Swarm
                        </SelectItem>
                        <SelectItem value="Split">Split</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Queen Color */}
              <FormField
                control={form.control}
                name="queenColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Queen Color</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select queen color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Brood Boxes */}
                <FormField
                  control={form.control}
                  name="broodBoxes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brood Boxes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Super Boxes */}
                <FormField
                  control={form.control}
                  name="superBoxes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super Boxes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* To-do */}
              <FormField
                control={form.control}
                name="todo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To-do</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes or tasks for this hive"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button type="submit" disabled={loading}>
                  <Edit className="mr-2 h-4 w-4" />
                  {loading ? "Updating..." : "Update Hive"}
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
        </CardContent>
      </Card>
    </main>
  );
}
