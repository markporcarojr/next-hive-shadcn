// app/inventory/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  TextInput,
  NumberInput,
  Select,
  Button,
  Stack,
  Title,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { inventorySchema, InventoryInput } from "@/lib/schemas/inventory";

const locations = ["Workshop", "Honey Room", "Storage Shed", "Garage", "Van"];

export default function EditInventoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const form = useForm<InventoryInput>({
    validate: zodResolver(inventorySchema),
    initialValues: {
      name: "",
      quantity: 0,
      location: "",
    },
  });

  useEffect(() => {
    const fetchInventory = async () => {
      const res = await fetch(`/api/inventory/${id}`);
      if (res.ok) {
        const data = await res.json();
        form.setValues({
          name: data.name,
          quantity: data.quantity,
          location: data.location,
        });
      }
      setLoading(false);
    };

    if (id) fetchInventory();
  }, [id]);

  const handleSubmit = async (values: InventoryInput) => {
    const res = await fetch(`/api/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push("/inventory");
    } else {
      alert("Update failed.");
    }
  };

  if (loading) return <Loader />;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Title order={3}>Edit Inventory</Title>

        <TextInput label="Item Name" required {...form.getInputProps("name")} />

        <NumberInput
          label="Quantity"
          required
          min={0}
          {...form.getInputProps("quantity")}
        />

        <Select
          label="Location"
          required
          data={locations.map((loc) => ({ label: loc, value: loc }))}
          {...form.getInputProps("location")}
        />

        <Button type="submit" color="yellow">
          Update Item
        </Button>
      </Stack>
    </form>
  );
}
