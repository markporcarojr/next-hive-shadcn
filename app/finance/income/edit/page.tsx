"use client";

import { IncomeInput, incomeSchema } from "@/lib/schemas/income";
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

export default function EditIncomePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState<IncomeInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const res = await fetch(`/api/income/${id}`);
        if (!res.ok) throw new Error("Failed to fetch income");
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        setError("Failed to load income record.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      incomeSchema.parse(formData);
      const res = await fetch(`/api/income/${id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update income");
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
        Edit Income
      </Title>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Source"
          placeholder="Sold honey or candles....."
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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
        <Button mt="md" type="submit" fullWidth>
          Update Income
        </Button>
      </form>
    </Box>
  );
}
