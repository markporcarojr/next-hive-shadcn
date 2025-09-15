"use client";

import { SwarmInput } from "@/lib/schemas/swarmTrap";
import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  Pagination,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 4;

export default function SwarmPage() {
  const [swarms, setSwarms] = useState<SwarmInput[]>([]);
  const [swarmToDelete, setSwarmToDelete] = useState<number | null>(null);
  const [modalOpen, { open, close }] = useDisclosure(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchSwarms = async () => {
      const res = await fetch("/api/swarm");
      const data = await res.json();
      setSwarms(data);
    };
    fetchSwarms();
  }, []);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const displayed = swarms.length
    ? swarms.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    : [];

  const handleDelete = async () => {
    if (!swarmToDelete) return;

    const res = await fetch(`/api/swarm?id=${swarmToDelete}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setSwarms((prev) => prev.filter((s) => s.id !== swarmToDelete));
      close();
      setSwarmToDelete(null);
    } else {
      notifications.show({
        position: "top-center",
        title: "Error",
        message: "Failed to delete swarm trap.",
        color: "red",
        icon: <IconX size={20} />,
      });
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <Group justify="space-between" mb="md">
        <Title order={2}>Swarm Traps</Title>
        <Button
          variant="filled"
          color="#f4b400"
          component={Link}
          href="/swarm/new"
        >
          Add Swarm Trap
        </Button>
      </Group>

      <Stack gap="md">
        {displayed.map((trap) => (
          <Card key={trap.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Trap #{trap.id}</Text>
              <Badge color="green">Active</Badge>
            </Group>

            <Text size="sm" c="dimmed">
              Label {trap.label}
            </Text>

            <Text size="sm" c="dimmed">
              Installed:{" "}
              {new Date(trap.installedAt).toISOString().split("T")[0]}
            </Text>

            {trap.removedAt && (
              <Text size="sm" c="dimmed">
                Removed: {new Date(trap.removedAt).toISOString().split("T")[0]}
              </Text>
            )}

            <Divider my="sm" />

            <Group justify="space-between" mt="md">
              <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                Notes: {trap.notes || "No notes provided."}
              </Text>
              <Divider my="sm" />
              <Button
                variant="light"
                size="xs"
                component={Link}
                href={`/swarm/edit/${trap.id}`}
              >
                Edit
              </Button>
              <Button
                variant="light"
                size="xs"
                color="red"
                onClick={() => {
                  setSwarmToDelete(trap.id!);
                  open();
                }}
              >
                Delete
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>

      <Pagination
        mt="xl"
        total={Math.ceil(swarms.length / ITEMS_PER_PAGE)}
        value={page}
        onChange={setPage}
        color="honey"
      />

      <Modal
        opened={modalOpen}
        onClose={() => {
          close();
          setSwarmToDelete(null);
        }}
        title="Confirm Deletion"
        centered
      >
        <Text mb="md">Are you sure you want to delete this swarm trap?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete}>
            Confirm Delete
          </Button>
        </Group>
      </Modal>
    </main>
  );
}
