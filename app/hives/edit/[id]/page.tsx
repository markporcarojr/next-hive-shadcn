"use client";

import { HiveInput, hiveSchema } from "@/lib/schemas/hive";
import {
  Button,
  Container,
  Group,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconEdit } from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditHivesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<HiveInput>({
    initialValues: {
      hiveNumber: 0,
      hiveSource: "",
      hiveDate: new Date(),
      queenColor: "",
      broodBoxes: 0,
      superBoxes: 0,
      todo: "",
    },
    validate: zodResolver(hiveSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/hives");
        const data = await res.json();
        const current = data.find((h: any) => h.id === Number(params.id));
        if (!current) return router.push("/hives");

        form.setValues({
          hiveNumber: current.hiveNumber,
          hiveSource: current.hiveSource,
          hiveDate: new Date(current.hiveDate),
          queenColor: current.queenColor || "",
          broodBoxes: current.broodBoxes || 0,
          superBoxes: current.superBoxes || 0,
          todo: current.todo || "",
        });
      } catch (e) {
        notifications.show({
          position: "top-center",
          title: "Error",
          message: "Failed to load data",
          color: "red",
        });
        router.push("/hives");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (values: HiveInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hives/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          hiveDate: new Date(values.hiveDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        notifications.show({
          position: "top-center",
          title: "Update failed",
          message: errorData.message || "Could not update hive.",
          color: "red",
        });
      } else {
        notifications.show({
          position: "top-center",
          title: "Hive Updated",
          message: `Hive #${values.hiveNumber} was updated successfully.`,
          color: "green",
        });
        router.push("/hives");
      }
    } catch (error) {
      console.error(error);
      notifications.show({
        position: "top-center",
        title: "Network error",
        message: "Something went wrong.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="lg">
        Edit Hive
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <DateInput
            label="Hive Date"
            {...form.getInputProps("hiveDate")}
            required
          />

          <NumberInput
            label="Hive Number"
            {...form.getInputProps("hiveNumber")}
            required
          />

          <Select
            label="Hive Source"
            data={["Nucleus", "Package", "Capture Swarm", "Split"]}
            {...form.getInputProps("hiveSource")}
            required
          />

          <TextInput
            label="Queen Color"
            {...form.getInputProps("queenColor")}
          />

          <NumberInput
            label="Brood Boxes"
            {...form.getInputProps("broodBoxes")}
          />

          <NumberInput
            label="Super Boxes"
            {...form.getInputProps("superBoxes")}
          />

          <Textarea label="To-do" {...form.getInputProps("todo")} />

          <Group justify="flex-end" mt="xl">
            <Button
              type="submit"
              leftSection={<IconEdit size={16} />}
              loading={loading}
              color="yellow"
            >
              Update Hive
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
