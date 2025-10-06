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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SwarmInput, swarmTrapFormSchema } from "@/lib/schemas/swarmTrap";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import MapPicker from "@/components/map-picker";

export default function EditSwarmPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SwarmInput>({
    resolver: zodResolver(swarmTrapFormSchema),
    defaultValues: {
      label: "",
      latitude: 42.78,
      longitude: -83.77,
      installedAt: new Date(),
      notes: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/swarm/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch swarm data");

        const data = await res.json();
        if (!data) {
          toast.error("Swarm trap not found");
          return router.push("/swarm");
        }

        form.reset({
          label: data.label,
          latitude: data.latitude,
          longitude: data.longitude,
          installedAt: new Date(data.installedAt),
          notes: data.notes || "",
        });
      } catch {
        toast.error("Failed to load swarm trap data");
        router.push("/swarm");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, form, router]);

  const onSubmit = async (values: SwarmInput) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/swarm/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          installedAt: new Date(values.installedAt).toISOString(),
          removedAt: values.removedAt
            ? new Date(values.removedAt).toISOString()
            : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to update swarm trap");
        return;
      } else {
        toast.success("Swarm trap updated successfully");
        router.push("/swarm");
      }
    } catch (error) {
      toast.error("Failed to update swarm trap");
      console.error(error);
    } finally {
      setSubmitting(false);
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
          <CardTitle>Edit Swarm Trap</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Label */}
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter trap label"
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <MapPicker
                initialLat={form.watch("latitude")}
                initialLng={form.watch("longitude")}
                onSelect={(lat, lng) => {
                  form.setValue("latitude", lat);
                  form.setValue("longitude", lng);
                }}
              />

              {/* Installed At Date */}
              <FormField
                control={form.control}
                name="installedAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Installed At *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
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

              {/* Removed At Date (Optional) */}
              {/* <FormField
                control={form.control}
                name="removedAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Removed At (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date (optional)</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                          autoFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this trap..."
                        {...field}
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button type="submit" disabled={submitting}>
                  <Edit className="mr-2 h-4 w-4" />
                  {submitting ? "Updating..." : "Update Trap"}
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
