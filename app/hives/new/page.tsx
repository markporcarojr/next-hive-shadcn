"use client";

import MapPicker from "@/components/map-picker";
import { HiveInput, hiveSchema } from "@/lib/schemas/hive";
import {
  Button,
  Group,
  NumberInput,
  Select,
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

export default function NewHivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<HiveInput>({
    initialValues: {
      hiveDate: new Date(),
      hiveNumber: 1,
      hiveSource: "",
      hiveImage: "",
      broodBoxes: 0,
      superBoxes: 0,
      hiveStrength: 50,
      queenColor: "",
      queenAge: "",
      queenExcluder: "",
      breed: "",
      frames: 0,
      todo: "",
    },
    validate: zodResolver(hiveSchema),
  });

  const handleSubmit = async (values: HiveInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/hives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        notifications.show({
          position: "top-center",
          title: "Error",
          message: errorData.message || "Failed to save hive",
          color: "red",
        });
        return;
      } else {
        notifications.show({
          position: "top-center",
          title: "Success",
          message: "Hive saved successfully",
          color: "green",
        });
        router.push("/hives");
      }
    } catch (error) {
      notifications.show({
        position: "top-center",
        title: "Error",
        message: "Failed to save hive",
        color: "red",
      });
      console.error("Failed to save hive:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <Title order={2} mb="lg">
        Add New Hive
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <MapPicker
            {...form.getInputProps("hiveLocation")}
            initialLat={form.values.latitude}
            initialLng={form.values.longitude}
            onSelect={(lat, lng) => {
              form.setFieldValue("latitude", lat);
              form.setFieldValue("longitude", lng);
            }}
          />
          <DateInput label="Hive Date" {...form.getInputProps("hiveDate")} />
          <NumberInput
            label="Hive Number"
            {...form.getInputProps("hiveNumber")}
            required
          />
          <Select
            label="Hive Source"
            placeholder="Select source"
            data={["Nucleus", "Package", "Capture Swarm", "Split"]}
            {...form.getInputProps("hiveSource")}
            required
          />
          <TextInput
            label="Hive Image URL"
            placeholder="Optional image URL"
            error={false}
            {...form.getInputProps("hiveImage")}
          />
          <NumberInput
            label="Brood Boxes"
            {...form.getInputProps("broodBoxes")}
          />
          <NumberInput
            label="Super Boxes"
            {...form.getInputProps("superBoxes")}
          />
          <NumberInput
            label="Hive Strength"
            min={0}
            max={100}
            {...form.getInputProps("hiveStrength")}
          />
          <TextInput
            label="Queen Color"
            {...form.getInputProps("queenColor")}
          />
          <TextInput label="Queen Age" {...form.getInputProps("queenAge")} />
          <Select
            label="Queen Excluder"
            data={["Yes", "No"]}
            placeholder="Select option"
            {...form.getInputProps("queenExcluder")}
          />
          <Select
            label="Breed"
            data={[
              "Italian",
              "Carniolan",
              "Buckfast",
              "Russian",
              "German",
              "Caucasian",
            ]}
            placeholder="Select breed"
            {...form.getInputProps("breed")}
          />
          <NumberInput label="Frames" {...form.getInputProps("frames")} />
          <Textarea
            label="To-do"
            placeholder="Notes or tasks for this hive"
            {...form.getInputProps("todo")}
          />
          <Group justify="flex-end">
            <Button type="submit" loading={loading} color="yellow">
              Save Hive
            </Button>
          </Group>
        </Stack>
      </form>
    </main>
  );
}
