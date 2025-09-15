"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "mantine-form-zod-resolver";
import { useForm } from "@mantine/form";
import { incomeSchema, IncomeInput } from "@/lib/schemas/income";
import {
  Button,
  Card,
  Group,
  TextInput,
  NumberInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { DateInput } from "@mantine/dates";

export default function NewIncomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<IncomeInput>({
    initialValues: {
      source: "",
      amount: 0,
      date: new Date(),
      notes: "",
    },
    validate: zodResolver(incomeSchema),
  });

  const onSubmit = async (values: IncomeInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/income", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        router.push("/finance/income");
      } else {
        const error = await res.json();
        alert(error.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("[INCOME_NEW]", err);
      alert("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card withBorder shadow="sm" radius="md" p="lg">
      <Title order={3} mb="lg">
        Add New Income
      </Title>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Source"
            placeholder="e.g., Honey Sale, Candle Sale"
            {...form.getInputProps("source")}
          />
          <NumberInput
            label="Amount"
            placeholder="Enter amount"
            {...form.getInputProps("amount")}
            min={0}
            step={0.01}
          />
          <DateInput
            placeholder="Select date"
            clearable={false}
            required
            minDate={new Date("2020-01-01")}
            maxDate={new Date()}
            error={form.errors.date ? form.errors.date : undefined}
            {...form.getInputProps("date")}
          />
          <TextInput
            label="Notes"
            placeholder="Optional notes"
            {...form.getInputProps("notes")}
          />
          <Group mt="md">
            <Button type="submit" loading={loading}>
              Submit
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/finance/income")}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </form>
      <Text mt="md" size="sm" color="dimmed">
        Please ensure all fields are filled out correctly before submitting.
      </Text>
    </Card>
  );
}
