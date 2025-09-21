"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { InspectionInput, inspectionSchema } from "@/lib/schemas/inspection";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Hive, Inspection } from "@prisma/client";

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
      const simplified = data.map((h: Hive) => ({
        value: String(h.id),
        label: `Hive #${h.hiveNumber}`,
      }));
      setHives(simplified);
    };

    fetchHives();
  }, []);

  const form = useForm<InspectionInput>({
    resolver: zodResolver(inspectionSchema),
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
    const fetchData = async () => {
      try {
        const res = await fetch("/api/inspection");
        const data = await res.json();
        const current = data.find(
          (h: Inspection) => h.id === Number(params.id)
        );
        if (!current) return router.push("/inspection");

        form.reset({
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
          weatherTemp: current.weatherTemp,
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
        toast.error(errorData.message || "Failed to update inspection");
        return;
      }

      toast.success("Successfully updated inspection");
      router.push("/inspection");
    } catch (error) {
      console.error(error);
      toast.error("Could not update inspection.");
    }
  };
  if (loading) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent>
            <div className="flex justify-center p-8">Loading...</div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Inspection</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Inspection Date */}
              <FormField
                control={form.control}
                name="inspectionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Inspection Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hive Selection */}
              <FormField
                control={form.control}
                name="hiveId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Hive *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
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
                    <FormMessage />
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
                          onValueChange={(values: number[]) =>
                            field.onChange(values[0])
                          }
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="queen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Queen</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="queenCell"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Queen Cell</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brood"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Brood</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disease"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Disease</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eggs"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Eggs</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* Temperament */}
              <FormField
                control={form.control}
                name="temperament"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperament</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick value" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Calm">Calm</SelectItem>
                        <SelectItem value="Aggressive">Aggressive</SelectItem>
                        <SelectItem value="Defensive">Defensive</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick value" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Varroa Mites">
                          Varroa Mites
                        </SelectItem>
                        <SelectItem value="Hive Beetles">
                          Hive Beetles
                        </SelectItem>
                        <SelectItem value="Ants">Ants</SelectItem>
                        <SelectItem value="Mice">Mice</SelectItem>
                        <SelectItem value="Wax Moths">Wax Moths</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick value" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fondant">Fondant</SelectItem>
                        <SelectItem value="Pollen Patties">
                          Pollen Patties
                        </SelectItem>
                        <SelectItem value="Sugar Syrup">Sugar Syrup</SelectItem>
                        <SelectItem value="No Feeding">No Feeding</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pick value" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Oxalic Acid">Oxalic Acid</SelectItem>
                        <SelectItem value="Formic Acid">Formic Acid</SelectItem>
                        <SelectItem value="Apivar">Apivar</SelectItem>
                        <SelectItem value="Diatomaceous Earth">
                          Diatomaceous Earth
                        </SelectItem>
                        <SelectItem value="No Treatments">
                          No Treatments
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                      <Textarea placeholder="Inspection notes..." {...field} />
                    </FormControl>
                    <FormMessage />
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
                        <Input placeholder="e.g., Sunny, Cloudy" {...field} />
                      </FormControl>
                      <FormMessage />
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
                        <Input placeholder="e.g., 75°F" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Inspection
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
