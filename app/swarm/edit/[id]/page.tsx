"use client";

import { SwarmInput, swarmTrapSchema } from "@/lib/schemas/swarmTrap";
import {
  Button,
  Container,
  Group,
  NumberInput,
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

export default function EditSwarmPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SwarmInput>({
    initialValues: {
      location: "",
      latitude: 42.78,
      longitude: -83.77,
      installedAt: new Date(),
      removedAt: undefined,
      notes: "",
    },
    validate: zodResolver(swarmTrapSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/swarm/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch swarm data");

        const data = await res.json();
        if (!data) {
          notifications.show({
            position: "top-center",
            title: "Error",
            message: "Swarm trap not found",
            color: "red",
          });
          return router.push("/swarm");
        }

        form.setValues({
          label: data.label,
          latitude: data.latitude,
          longitude: data.longitude,
          installedAt: new Date(data.installedAt),
          removedAt: data.removedAt ? new Date(data.removedAt) : undefined,
          notes: data.notes || "",
        });
      } catch (error) {
        notifications.show({
          position: "top-center",
          title: "Error",
          message: "Failed to load swarm trap data",
          color: "red",
        });
      }
    };

    fetchData();
  }, [params.id]);

  const onSubmit = async (values: SwarmInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/swarm/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          installedAt: new Date(values.installedAt).toISOString(),
        }),
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
          message: "Swarm trap updated successfully",
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="lg">
        Edit Trap
      </Title>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Location"
            required
            {...form.getInputProps("location")}
          />

          <NumberInput
            label="Latitude"
            min={-90}
            max={90}
            required
            {...form.getInputProps("latitude")}
          />

          <NumberInput
            label="Longitude"
            min={-180}
            max={180}
            required
            {...form.getInputProps("longitude")}
          />

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
            <Button
              type="submit"
              leftSection={<IconEdit size={16} />}
              loading={loading}
              color="yellow"
            >
              Update Trap
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
