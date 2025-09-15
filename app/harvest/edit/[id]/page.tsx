"use client";

import { HarvestInput, harvestSchema } from "@/lib/schemas/harvest";
import {
  Button,
  Container,
  Group,
  NumberInput,
  Select,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { zodResolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditHarvestPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const form = useForm<HarvestInput>({
    initialValues: {
      harvestAmount: 0,
      harvestType: "",
      harvestDate: new Date(),
    },
    validate: zodResolver(harvestSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/harvest");
        const data = await res.json();
        const current = data.find((h: any) => h.id === Number(params.id));
        if (!current) return router.push("/harvest");

        form.setValues({
          harvestAmount: current.harvestAmount,
          harvestType: current.harvestType,
          harvestDate: new Date(current.harvestDate),
        });
      } catch (e) {
        notifications.show({
          position: "top-center",
          title: "Error",
          message: "Failed to load data",
          color: "red",
        });
        router.push("/harvest");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (values: HarvestInput) => {
    try {
      const res = await fetch(`/api/harvest?id=${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          harvestDate: values.harvestDate.toISOString(),
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        notifications.show({
          position: "top-center",
          title: "Error",
          message: result.message || "Update failed",
          color: "red",
        });
        return;
      }

      notifications.show({
        position: "top-center",
        title: "Success",
        message: "Harvest updated!",
        color: "green",
      });
      router.push("/harvest");
    } catch (e) {
      notifications.show({
        position: "top-center",
        title: "Error",
        message: "Something went wrong",
        color: "red",
      });
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="lg">
        Edit Harvest
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
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
          <Button type="submit">Update</Button>
        </Group>
      </form>
    </Container>
  );
}
