"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  TextInput,
  NumberInput,
  Button,
  Box,
  Title,
  Text,
  Textarea,
} from "@mantine/core";
import { InvoiceInput, invoiceSchema } from "@/lib/schemas/invoice";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState<InvoiceInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoice/${id}`);
        if (!res.ok) throw new Error("Failed to fetch invoice");
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        setError("Failed to load invoice record.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      invoiceSchema.parse(formData);
      const res = await fetch(`/api/invoice/${id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update invoice");
      router.push("/finance");
    } catch (err) {
      setError("Something went wrong while saving.");
      console.error(err);
    }
  };

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text c="red">{error}</Text>;
  if (!formData) return null;

  return (
    <Box maw={500} mx="auto">
      <Title order={3} mb="md">
        Edit Invoice
      </Title>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Title"
          placeholder="Honey Order"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <TextInput
          label="Customer Name"
          placeholder="Jane Doe"
          value={formData.customerName}
          onChange={(e) =>
            setFormData({ ...formData, customerName: e.target.value })
          }
          required
        />
        <NumberInput
          label="Total"
          value={formData.total}
          onChange={(value) =>
            setFormData({ ...formData, total: Number(value) })
          }
          step={0.01}
          min={0}
          required
        />
        <TextInput
          label="Date"
          type="date"
          value={formData.date.toString().slice(0, 10)}
          onChange={(e) =>
            setFormData({ ...formData, date: new Date(e.target.value) })
          }
          required
        />
        <Textarea
          label="Notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
        <Button mt="md" type="submit" fullWidth>
          Update Invoice
        </Button>
      </form>
    </Box>
  );
}
