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
import { Textarea } from "@/components/ui/textarea";
import { HiveInput, hiveFormSchema } from "@/lib/schemas/hive";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DetailPageSkeleton } from "@/components/detail-page-skeleton";

export default function ReadOnlyHivePage({ params }: { params: Promise<{ id: string }> }) {
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
        toast.error("Failed to load hive data");
        router.push("/hives");
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
          <CardTitle>Hive Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Hive Date */}
              <FormField
                control={form.control}
                name="hiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hive Date</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        value={field.value ? format(new Date(field.value), "PPP") : ""}
                        readOnly
                      />
                    </FormControl>
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
                    <FormLabel>Hive Number</FormLabel>
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

              {/* Hive Source */}
              <FormField
                control={form.control}
                name="hiveSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hive Source</FormLabel>
                    <Select disabled value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
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

              {/* Queen Color */}
              <FormField
                control={form.control}
                name="queenColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Queen Color</FormLabel>
                    <Select disabled value={field.value}>
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
                  onClick={() => router.push(`/hives/edit/${id}`)}
                >
                  Edit Hive
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
