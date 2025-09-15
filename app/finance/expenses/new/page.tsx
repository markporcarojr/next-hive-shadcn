"use client";

import { ExpenseInput, expenseSchema } from "@/lib/schemas/expense";
import {
  Button,
  Card,
  NumberInput,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<ExpenseInput>({
    initialValues: {
      item: "",
      amount: 0,
      date: new Date(),
      notes: "",
    },
    validate: zodResolver(expenseSchema),
  });

  const onSubmit = async (values: ExpenseInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        router.push("/finance/expenses");
      } else {
        const error = await res.json();
        alert(error.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("[EXPENSE_NEW]", err);
      alert("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card withBorder shadow="sm" radius="md" p="lg">
      <Title order={3} mb="lg">
        Add New Expense
      </Title>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Item"
            placeholder="Item"
            {...form.getInputProps("item")}
          />
          <NumberInput
            label="Amount ($)"
            placeholder="Amount"
            min={0}
            step={0.01}
            {...form.getInputProps("amount")}
          />
          <DateInput
            label="Date"
            placeholder="Date"
            {...form.getInputProps("date")}
          />

          <TextInput
            label="Notes"
            placeholder="Notes"
            {...form.getInputProps("notes")}
          />
          <Button type="submit" loading={loading} variant="primary">
            Add Expense
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
