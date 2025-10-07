"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  InspectionInput,
  inspectionFormSchema,
} from "@/lib/schemas/inspection";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hive } from "@prisma/client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DetailPageSkeleton } from "@/components/detail-page-skeleton";

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

export default function ReadOnlyInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hives, setHives] = useState<{ value: string; label: string }[]>([]);

  const form = useForm<InspectionInput>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      id: 0,
      temperament: "",
      hiveStrength: 0,
      hiveId: 0,
      inspectionDate: new Date(),
      inspectionImage: "",
      queen: false,
      queenCell: false,
      brood: false,
      disease: false,
      eggs: false,
      pests: "",
      feeding: "",
      treatments: "",
      inspectionNote: "",
      weatherCondition: "",
      weatherTemp: "",
    },
  });

  useEffect(() => {
    const fetchHives = async () => {
      const res = await fetch("/api/hives");
      const data = await res.json();
      const simplified = data.map((h: Hive) => ({
        value: String(h.id),
        label: `Hive #${h.hiveNumber}`,
      }));
      setHives(simplified);
    };

    fetchHives();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/inspection/${params.id}`);
        const current = await res.json();

        form.reset({
          id: current.id ?? 0,
          temperament: current.temperament || "",
          hiveStrength: current.hiveStrength ?? 0,
          hiveId: current.hiveId ?? 0,
          inspectionDate: current.inspectionDate
            ? new Date(current.inspectionDate)
            : new Date(),
          inspectionImage: current.inspectionImage || "",
          queen: current.queen ?? false,
          queenCell: current.queenCell ?? false,
          brood: current.brood ?? false,
          disease: current.disease ?? false,
          eggs: current.eggs ?? false,
          pests: current.pests || "",
          feeding: current.feeding || "",
          treatments: current.treatments || "",
          inspectionNote: current.inspectionNote || "",
          weatherCondition: current.weatherCondition || "",
          weatherTemp: current.weatherTemp || "",
        });
      } catch {
        toast.error("Failed to load data");
        router.push("/inspection");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, form, router]);

  if (loading) {
    return <DetailPageSkeleton />;
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Inspection Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Inspection Date */}
              <FormField
                control={form.control}
                name="inspectionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Inspection Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            disabled
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          selected={field.value}
                          mode="single"
                          disabled
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              {/* Hive Selection */}
              <FormField
                control={form.control}
                name="hiveId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Hive</FormLabel>
                    <Select
                      disabled
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a hive" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hives.map((hive) => (
                          <SelectItem key={hive.value} value={hive.value}>
                            {hive.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Hive Strength Slider */}
              <FormField
                control={form.control}
                name="hiveStrength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Hive Strength:{" "}
                      <span style={{ color: getColor(field.value) }}>
                        {getStrengthLabel(field.value)}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <div className="px-3">
                        <Slider
                          value={[field.value]}
                          disabled
                          max={100}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-4">
                {["queen", "queenCell", "brood", "disease", "eggs"].map(
                  (name) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name as keyof InspectionInput}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              disabled
                            />
                          </FormControl>
                          <FormLabel className="font-normal capitalize">
                            {name}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  )
                )}
              </div>

              {/* Temperament */}
              <FormField
                control={form.control}
                name="temperament"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperament</FormLabel>
                    <Select disabled value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick value" />
                        </SelectTrigger>
                      </FormControl>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Pests */}
              <FormField
                control={form.control}
                name="pests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pests</FormLabel>
                    <FormControl>
                      <Input disabled value={field.value || ""} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Feeding */}
              <FormField
                control={form.control}
                name="feeding"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feeding</FormLabel>
                    <FormControl>
                      <Input disabled value={field.value || ""} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Treatments */}
              <FormField
                control={form.control}
                name="treatments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatments</FormLabel>
                    <FormControl>
                      <Input disabled value={field.value || ""} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="inspectionNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea disabled value={field.value || ""} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Weather Condition */}
                <FormField
                  control={form.control}
                  name="weatherCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weather Condition</FormLabel>
                      <FormControl>
                        <Input disabled value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Weather Temperature */}
                <FormField
                  control={form.control}
                  name="weatherTemp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weather Temp</FormLabel>
                      <FormControl>
                        <Input disabled value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {form.getValues("inspectionImage") && (
                <div className="mt-4">
                  <Image
                    src={form.getValues("inspectionImage") || ""}
                    alt="Inspection"
                    width={600}
                    height={320}
                    className="rounded-lg border mt-2 max-h-80 object-cover"
                  />
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/inspection/edit/${params.id}`)}
                >
                  Edit Inspection
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
