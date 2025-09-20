"use client";

import { inventorySchema, InventoryInput } from "@/lib/schemas/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ITEM_NAMES } from "../../../data/inventoryAutoComplete";

const LOCATIONS = ["Storage", "Shop", "Garage", "Field", "Other"];

export default function NewInventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState(ITEM_NAMES);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InventoryInput>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
      quantity: 0,
      location: "",
    },
  });

  const handleSubmit = async (values: InventoryInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success("Inventory item saved successfully");
        router.push("/inventory");
      } else {
        toast.error("Failed to save inventory item");
      }
    } catch (error) {
      toast.error("Failed to save inventory item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-md mx-auto">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Add Inventory Item</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter item name" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
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
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-yellow-500 hover:bg-yellow-600"
          >
            {isLoading ? "Saving..." : "Save Item"}
          </Button>
        </form>
      </Form>
    </main>
  );
}
