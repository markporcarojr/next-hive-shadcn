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
import { SwarmInput, swarmTrapFormSchema } from "@/lib/schemas/swarmTrap";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { DetailPageSkeleton } from "@/components/detail-page-skeleton";

export default function ReadOnlySwarmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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
        const res = await fetch(`/api/swarm/${id}`);
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
  }, [id, form, router]);

  if (loading) {
    return <DetailPageSkeleton />;
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Swarm Trap Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Label */}
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Latitude */}
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled
                        {...field}
                        value={field.value || ""}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Longitude */}
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled
                        {...field}
                        value={field.value || ""}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Installed At Date */}
              <FormField
                control={form.control}
                name="installedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installed At</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        value={field.value ? format(field.value, "PPP") : ""}
                        readOnly
                      />
                    </FormControl>
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
                    <FormControl>
                      <Textarea
                        disabled
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/swarm/edit/${id}`)}
                >
                  Edit Swarm Trap
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
