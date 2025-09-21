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
import { inventorySchema, InventoryInput } from "@/lib/schemas/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Edit } from "lucide-react";

const LOCATIONS = ["Workshop", "Honey Room", "Storage Shed", "Garage", "Van"];

export default function EditInventoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<InventoryInput>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
      quantity: 0,
      location: "",
    },
  });

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(`/api/inventory/${id}`);
        if (res.ok) {
          const data = await res.json();
          form.reset({
            name: data.name,
            quantity: data.quantity,
            location: data.location,
          });
        } else {
          toast.error("Failed to load inventory item");
          router.push("/inventory");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load inventory item");
        router.push("/inventory");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInventory();
  }, [id, form, router]);

  const handleSubmit = async (values: InventoryInput) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success("Inventory item updated successfully");
        router.push("/inventory");
      } else {
        toast.error("Update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="p-8 max-w-lg mx-auto">
        <Card>
          <CardContent>
            <div className="flex justify-center p-8">Loading...</div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Item Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter item name"
                        {...field}
                        disabled={submitting}
                      />
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
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={submitting}
                      />
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
                    <FormLabel>Location *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                <Button type="submit" disabled={submitting}>
                  <Edit className="mr-2 h-4 w-4" />
                  {submitting ? "Updating..." : "Update Item"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
