"use client";

import { useForm } from "@mantine/form";
import { inventorySchema, InventoryInput } from "@/lib/schemas/inventory";
import { zodResolver } from "mantine-form-zod-resolver";
import {
  Button,
  NumberInput,
  Stack,
  Title,
  Select,
  Autocomplete,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ITEM_NAMES } from "../../../data/inventoryAutoComplete";

const LOCATIONS = ["Storage", "Shop", "Garage", "Field", "Other"];

// Preset item names (could later be loaded from DB)

export default function NewInventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState(ITEM_NAMES);

  const form = useForm<InventoryInput>({
    validate: zodResolver(inventorySchema),
    initialValues: {
      name: "",
      quantity: 0,
      location: "",
    },
  });

  const handleSubmit = async (values: InventoryInput) => {
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) router.push("/inventory");
    else alert("Failed to save inventory item");
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Title order={2}>Add Inventory Item</Title>

        <Autocomplete
          label="Item Name"
          placeholder="Select or type a new item"
          required
          data={items}
          value={form.values.name}
          onChange={(value) => {
            form.setFieldValue("name", value);
            if (!items.includes(value) && value.trim()) {
              setItems((prev) => [...prev, value]);
            }
          }}
        />

        <NumberInput
          label="Quantity"
          required
          min={0}
          {...form.getInputProps("quantity")}
        />

        <Select
          label="Location"
          placeholder="Choose a location"
          data={LOCATIONS}
          required
          {...form.getInputProps("location")}
        />

        <Button type="submit" color="yellow">
          Save Item
        </Button>
      </Stack>
    </form>
  );
}
