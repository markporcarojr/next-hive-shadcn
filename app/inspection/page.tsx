"use client";

import { InspectionWithHive } from "@/lib/schemas/inspection";
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

export default function InspectionPage() {
  const [inspections, setInspections] = useState<InspectionWithHive[]>([]);
  const [inspectionToDelete, setInspectionToDelete] = useState<number | null>(
    null
  );
  const [modalOpen, { open, close }] = useDisclosure(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/inspection");
      const data = await res.json();
      setInspections(data);
    };
    fetchData();
  }, []);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const displayed =
    inspections && inspections.length > 0
      ? inspections.slice(start, start + ITEMS_PER_PAGE)
      : [];

  const handleDelete = async () => {
    if (!inspectionToDelete) return;

    const res = await fetch(`/api/inspection?id=${inspectionToDelete}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setInspections((prev) => prev.filter((h) => h.id !== inspectionToDelete));
      close();
      setInspectionToDelete(null);
    } else {
      notifications.show({
        position: "top-center",
        title: "Error",
        message: "Failed to delete inspection record.",
        color: "red",
        icon: <IconX size={20} />,
      });
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <Group justify="space-between" mb="md">
        <Title order={2}>Inspection Log</Title>
        <Button
          variant="filled"
          color="#f4b400"
          component={Link}
          href="/inspection/new"
        >
          Add Inspection
        </Button>
      </Group>

      <Stack gap="md">
        {displayed.map((entry) => (
          <Card key={entry.id} shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between">
              <Title order={4}>Hive #{entry.hive.hiveNumber}</Title>
              <Badge>
                {new Date(entry.inspectionDate).toISOString().split("T")[0]}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              Temperament: {entry.temperament}
            </Text>
            <Text size="sm" c="dimmed">
              Hive Strength: {entry.hiveStrength}
            </Text>
            <Text size="sm" mt="xs">
              Notes: {entry.inspectionNote || "No notes provided"}
            </Text>
            <Divider my="sm" />
            <Group justify="space-between">
              <Button
                size="xs"
                variant="light"
                component={Link}
                href={`/inspection/edit/${entry.id}`}
              >
                Edit
              </Button>
              <Button
                variant="light"
                size="xs"
                color="red"
                onClick={() => {
                  setInspectionToDelete(entry.id!);
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
        total={Math.ceil(inspections.length / ITEMS_PER_PAGE)}
        value={page}
        onChange={setPage}
        color="honey"
      />
      <Modal
        opened={modalOpen}
        onClose={() => {
          close();
          setInspectionToDelete(null);
        }}
        title="Confirm Deletion"
        centered
      >
        <Text mb="md">Are you sure you want to delete this record?</Text>
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
