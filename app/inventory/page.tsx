// app/inventory/page.tsx
"use client";

import { InventoryInput } from "@/lib/schemas/inventory";
import {
  Button,
  Card,
  Group,
  Modal,
  Pagination,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 5;

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryInput[]>([]);
  const [page, setPage] = useState(1);
  const [modalOpen, { open, close }] = useDisclosure(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [inventoryToDelete, setInventoryToDelete] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setItems(data);
    };
    fetchData();
  }, []);

  // Check if items data is loaded
  if (!items || items.length === 0) {
    return (
      <main style={{ padding: "2rem" }}>
        <Title order={2}>Inventory</Title>
        <Text mt="md">No inventory data found.</Text>
      </main>
    );
  }

  const filteredItems =
    items && items.length > 0
      ? selectedLocation
        ? items.filter((item) => item.location === selectedLocation)
        : items
      : [];

  // Ensure filteredItems has data before calculating start
  const start =
    filteredItems && filteredItems.length > 0 ? (page - 1) * ITEMS_PER_PAGE : 0;
  const displayed =
    filteredItems && filteredItems.length > 0
      ? filteredItems.slice(start, start + ITEMS_PER_PAGE)
      : [];

  const uniqueLocations =
    items && items.length > 0
      ? Array.from(new Set(items.map((item) => item.location))).map((loc) => ({
          label: loc,
          value: loc,
        }))
      : [];

  const handleDelete = async () => {
    if (!inventoryToDelete) return;

    const res = await fetch(`/api/inventory?id=${inventoryToDelete}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setItems((prev) => prev.filter((h) => h.id !== inventoryToDelete));
      close();
      setInventoryToDelete(null);
    } else {
      notifications.show({
        position: "top-center",
        title: "Error",
        message: "Failed to delete inventory record.",
        color: "red",
        icon: <IconX size={20} />,
        autoClose: 4000,
        withCloseButton: true,
      });
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <Group justify="space-between" mb="md">
        <Title order={2}>Inventory</Title>
        <Button
          variant="filled"
          color="#f4b400"
          component={Link}
          href="/inventory/new"
        >
          Add Inventory Item
        </Button>
        <Select
          placeholder="Filter by location"
          data={uniqueLocations}
          clearable
          value={selectedLocation}
          onChange={setSelectedLocation}
        />
      </Group>

      <Stack gap="sm">
        {displayed.map((item) => (
          <Card key={item.id} withBorder shadow="xs" padding="md">
            <Group justify="space-between">
              <Text fw={500}>{item.name}</Text>
              <Text c="dimmed">Qty: {item.quantity}</Text>
            </Group>
            <Text size="sm" c="dimmed">
              Location: {item.location}
            </Text>
            <Group justify="space-between">
              <Button
                size="xs"
                variant="light"
                component={Link}
                href={`/inventory/edit/${item.id}`}
              >
                Edit
              </Button>
              <Button
                color="red"
                variant="light"
                size="xs"
                onClick={() => {
                  setInventoryToDelete(item.id!);
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
        total={Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
        value={page}
        onChange={setPage}
        color="honey"
      />
      <Modal
        opened={modalOpen}
        onClose={() => {
          close();
          setInventoryToDelete(null);
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
