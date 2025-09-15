"use client";

import { ExpenseInput, expenseSchema } from "@/lib/schemas/expense";
import {
  Box,
  Button,
  NumberInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState<ExpenseInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await fetch(`/api/expense/${id}`);
        if (!res.ok) throw new Error("Failed to fetch expense");
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        setError("Failed to load expense record.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      expenseSchema.parse(formData);
      const res = await fetch(`/api/expense/${id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update expense");
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
        Edit Expense
      </Title>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Item"
          placeholder="Smoker"
          value={formData.item}
          onChange={(e) => setFormData({ ...formData, item: e.target.value })}
          required
        />

        <NumberInput
          label="Amount"
          value={formData.amount}
          onChange={(value) =>
            setFormData({ ...formData, amount: Number(value) })
          }
          required
          step={0.01}
          min={0}
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
        <TextInput
          label="Notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
        <Button mt="md" type="submit" fullWidth>
          Update Expense
        </Button>
      </form>
    </Box>
  );
}
