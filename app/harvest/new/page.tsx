"use client";

import { HarvestInput, harvestSchema } from "@/lib/schemas/harvest"; // ✅ import your schema
import {
  Button,
  Container,
  Group,
  NumberInput,
  Select,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";

export default function CreateHarvestPage() {
  const router = useRouter();

  const form = useForm<HarvestInput>({
    initialValues: {
      harvestAmount: 0,
      harvestType: "",
      harvestDate: new Date(),
    },
    validate: zodResolver(harvestSchema),
  });

  const onSubmit = async (values: HarvestInput) => {
    try {
      const res = await fetch("/api/harvest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          harvestDate: values.harvestDate.toISOString(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        notifications.show({
          position: "top-center",
          title: "Error",
          message: result?.errors?.harvestType?.[0] || result.message,
          color: "red",
        });
        return;
      }

      notifications.show({
        position: "top-center",
        title: "Harvest Added",
        message: `You recorded ${values.harvestAmount} lbs of ${values.harvestType}`,
        color: "green",
      });

      form.reset();
      router.push("/harvest");
    } catch (error) {
      console.error(error);
      notifications.show({
        position: "top-center",
        title: "Network Error",
        message: "Could not save harvest. Please try again.",
        color: "red",
      });
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="lg">
        Add New Harvest
      </Title>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <NumberInput
          label="Harvest Amount (lbs)"
          {...form.getInputProps("harvestAmount")}
          mb="md"
        />

        <Select
          label="Harvest Type"
          placeholder="Pick one"
          data={["Honey", "Wax"]}
          {...form.getInputProps("harvestType")}
          mb="md"
        />

        <DateInput
          label="Harvest Date"
          placeholder="MM-DD-YYYY"
          valueFormat="MM-DD-YYYY"
          {...form.getInputProps("harvestDate")}
          mb="md"
        />

        <Group justify="flex-end" mt="xl">
          <Button type="submit" leftSection={<IconPlus size={16} />}>
            Add Harvest
          </Button>
        </Group>
      </form>
    </Container>
  );
}
