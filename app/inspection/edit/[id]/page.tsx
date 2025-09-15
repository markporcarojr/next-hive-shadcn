"use client";

import { InspectionInput, inspectionSchema } from "@/lib/schemas/inspection";
import {
  Button,
  Checkbox,
  Container,
  Group,
  Select,
  Slider,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconHeart, IconPlus } from "@tabler/icons-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getStrengthLabel(value: number) {
  if (value < 35) return "Weak";
  if (value < 70) return "Moderate";
  return "Strong";
}

function getColor(value: number) {
  if (value < 35) return "red";
  if (value < 70) return "yellow";
  return "green";
}

export default function EditInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hives, setHives] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchHives = async () => {
      const res = await fetch("/api/hives");
      const data = await res.json();
      const simplified = data.map((h: any) => ({
        value: String(h.id),
        label: `Hive #${h.hiveNumber}`,
      }));
      setHives(simplified);
    };

    fetchHives();
  }, []);

  const form = useForm<InspectionInput>({
    initialValues: {
      id: 0,
      temperament: "",
      hiveStrength: 0,
      hiveId: 0,
      inspectionDate: new Date(),
      inspectionImage: "",
      queen: undefined,
      queenCell: undefined,
      brood: undefined,
      disease: undefined,
      eggs: undefined,
      pests: "",
      feeding: "",
      treatments: "",
      inspectionNote: "",
      weatherCondition: "",
      weatherTemp: "",
    },
    validate: zodResolver(inspectionSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/inspection");
        const data = await res.json();
        const current = data.find((h: any) => h.id === Number(params.id));
        if (!current) return router.push("/inspection");

        form.setValues({
          id: current.id,
          temperament: current.temperament,
          hiveStrength: current.hiveStrength,
          hiveId: current.hiveId,
          inspectionDate: new Date(current.inspectionDate),
          inspectionImage: current.inspectionImage,
          queen: current.queen,
          queenCell: current.queenCell,
          brood: current.brood,
          disease: current.disease,
          eggs: current.eggs,
          pests: current.pests,
          feeding: current.feeding,
          treatments: current.treatments,
          inspectionNote: current.inspectionNote,
          weatherCondition: current.weatherCondition,
        });
      } catch (e) {
        notifications.show({
          position: "top-center",
          title: "Error",
          message: "Failed to load data",
          color: "red",
        });
        router.push("/inspection");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (values: InspectionInput) => {
    const parsed = {
      ...values,
      hiveId: Number(values.hiveId), // 👈 convert string to number
    };

    try {
      const res = await fetch(`/api/inspection/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        notifications.show({
          position: "top-center",
          title: "Error",
          message: errorData.message || "Failed to create inspection",
          color: "red",
        });
        return;
      }

      notifications.show({
        position: "top-center",
        title: "Inspection Updated",
        message: "Successfully Updates inspection",
        color: "green",
      });
      router.push("/inspection");
    } catch (error) {
      console.error(error);
      notifications.show({
        position: "top-center",
        title: "Network Error",
        message: "Could not update inspection.",
        color: "red",
      });
    }
  };
  console.log("Hives array:", hives);

  return (
    <Container size="sm" mt="xl">
      <Title order={2} mb="lg">
        Edit Inspection
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <DateInput
            label="Inspection Date"
            {...form.getInputProps("inspectionDate")}
            required
          />
          <Select
            label="Select Hive"
            placeholder="Choose a hive"
            data={hives}
            {...form.getInputProps("hiveId")}
            required
          />

          <Text fw={500} size="sm">
            Hive Strength
          </Text>
          <Slider
            label={` ${getStrengthLabel(form.values.hiveStrength)}`}
            thumbChildren={<IconHeart size={16} />}
            color={getColor(form.values.hiveStrength)}
            thumbSize={26}
            min={0}
            max={100}
            step={1}
            value={form.values.hiveStrength}
            onChange={(value) => form.setFieldValue("hiveStrength", value)}
            styles={{ thumb: { borderWidth: 2, padding: 3 } }}
          />

          <Checkbox
            label="Queen"
            {...form.getInputProps("queen", { type: "checkbox" })}
          />

          <Checkbox
            label="Queen Cell"
            {...form.getInputProps("queenCell", { type: "checkbox" })}
          />

          <Checkbox
            label="Brood"
            {...form.getInputProps("brood", { type: "checkbox" })}
          />

          <Checkbox
            label="Disease"
            {...form.getInputProps("disease", { type: "checkbox" })}
          />

          <Checkbox
            label="Eggs"
            {...form.getInputProps("eggs", { type: "checkbox" })}
          />

          <Select
            label="Temperament"
            placeholder="Pick value"
            data={["Calm", "Aggressive", "Defensive", "Normal", "Other"]}
            {...form.getInputProps("temperament")}
          />

          <Select
            label="Pests"
            placeholder="Pick value"
            data={[
              "Varroa Mites",
              "Hive Beetles",
              "Ants",
              "Mice",
              "Wax Moths",
              "Other",
            ]}
            {...form.getInputProps("pests")}
          />
          <Select
            label="Feeding"
            placeholder="Pick value"
            data={[
              "Fondant",
              "Pollen Patties",
              "Sugar Syrup",
              "No Feeding",
              "Other",
            ]}
            {...form.getInputProps("feeding")}
          />
          <Select
            label="Treatmnets"
            placeholder="Pick value"
            data={[
              "Oxalic Acid",
              "Formic Acid",
              "Apivar",
              "Diatomaceous Earth",
              "No Treatments",
              "Other",
            ]}
            {...form.getInputProps("treatments")}
          />

          <Textarea label="Notes" {...form.getInputProps("inspectionNote")} />

          <TextInput
            label="Weather Condition"
            {...form.getInputProps("weatherCondition")}
          />

          <TextInput
            label="Weather Temp"
            {...form.getInputProps("weatherTemp")}
          />

          <Group justify="flex-end" mt="xl">
            <Button type="submit" leftSection={<IconPlus size={16} />}>
              Update Inspection
            </Button>
          </Group>
        </Stack>
      </form>
    </Container>
  );
}
