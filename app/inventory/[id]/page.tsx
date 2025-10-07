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
import { InventoryInput, inventorySchema } from "@/lib/schemas/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const LOCATIONS = ["Storage", "Shop", "Garage", "Field", "Other"];

export default function ReadOnlyInventoryPage() {
  const params = useParams();
  const router = useRouter();

  const form = useForm<InventoryInput>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      id: 0,
      name: "",
      quantity: 0,
      location: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/inventory/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch item");

        const current = await res.json();
        form.reset({
          id: current.id ?? 0,
          name: current.name ?? "",
          quantity: current.quantity ?? 0,
          location: current.location ?? "",
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to load item data");
        router.push("/inventory");
      } finally {
      }
    };

    fetchData();
  }, [params.id, form, router]);

  return (
    <main className="p-8 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Item Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select disabled value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/inventory/edit/${params.id}`)}
                >
                  Edit Item
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
