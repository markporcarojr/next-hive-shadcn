"use client";

import MapPicker from "@/components/map-picker";
import { SwarmInput, swarmTrapSchema } from "@/lib/schemas/swarmTrap";
import {
  Button,
  Container,
  Group,
  Stack,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { zodResolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewSwarmPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SwarmInput>({
    initialValues: {
      label: "",
      latitude: 42.78,
      longitude: -83.77,
      installedAt: new Date(),
      removedAt: undefined,
      notes: "",
    },
    validate: zodResolver(swarmTrapSchema),
  });

  const onSubmit = async (values: SwarmInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/swarm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        notifications.show({
          position: "top-center",
          title: "Error",
          message: errorData.message || "Failed to update swarm trap",
          color: "red",
        });
        return;
      } else {
        notifications.show({
          position: "top-center",
          title: "Success",
          message: "Swarm trap added successfully",
          color: "green",
        });
        router.push("/swarm");
      }
    } catch (error) {
      notifications.show({
        position: "top-center",
        title: "Error",
        message: "Failed to update swarm trap",
        color: "red",
      });
      console.error("Failed to save trap:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="lg">
        Add New Swarm Trap
      </Title>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <MapPicker
            initialLat={form.values.latitude}
            initialLng={form.values.longitude}
            onSelect={(lat, lng) => {
              form.setFieldValue("latitude", lat);
              form.setFieldValue("longitude", lng);
            }}
          />
          <TextInput label="Label" required {...form.getInputProps("label")} />

          <DateInput
            label="Installed At"
            required
            {...form.getInputProps("installedAt")}
          />

          <DateInput
            label="Removed At"
            clearable
            {...form.getInputProps("removedAt")}
          />

          <Textarea
            label="Notes"
            autosize
            minRows={3}
            {...form.getInputProps("notes")}
          />

          <Group justify="flex-end">
            <Button type="submit" loading={loading} color="yellow">
              Add Trap
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
