"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import MapPicker from "@/components/map-picker";
import { HiveInput, hiveSchema } from "@/lib/schemas/hive";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewHivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<HiveInput>({
    resolver: zodResolver(hiveSchema),
    defaultValues: {
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
        toast.error(errorData.message || "Failed to save hive");
        return;
      } else {
        toast.success("Hive saved successfully");
        router.push("/hives");
      }
    } catch (error) {
      toast.error("Failed to save hive");
      console.error("Failed to save hive:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Hive</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Map Picker for Location */}
              <MapPicker
                initialLat={form.watch("latitude")}
                initialLng={form.watch("longitude")}
                onSelect={(lat, lng) => {
                  form.setValue("latitude", lat);
                  form.setValue("longitude", lng);
                }}
              />

              {/* Hive Date */}
              <FormField
                control={form.control}
                name="hiveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Hive Date</FormLabel>
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

              {/* Hive Number */}
              <FormField
                control={form.control}
                name="hiveNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hive Number *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hive Source */}
              <FormField
                control={form.control}
                name="hiveSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hive Source *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nucleus">Nucleus</SelectItem>
                        <SelectItem value="Package">Package</SelectItem>
                        <SelectItem value="Capture Swarm">Capture Swarm</SelectItem>
                        <SelectItem value="Split">Split</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hive Image URL */}
              <FormField
                control={form.control}
                name="hiveImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hive Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Optional image URL"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Brood Boxes */}
                <FormField
                  control={form.control}
                  name="broodBoxes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brood Boxes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Super Boxes */}
                <FormField
                  control={form.control}
                  name="superBoxes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super Boxes</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Hive Strength */}
              <FormField
                control={form.control}
                name="hiveStrength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hive Strength (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* Queen Color */}
                <FormField
                  control={form.control}
                  name="queenColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Queen Color</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Red, Blue"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Queen Age */}
                <FormField
                  control={form.control}
                  name="queenAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Queen Age</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1 year"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Queen Excluder */}
              <FormField
                control={form.control}
                name="queenExcluder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Queen Excluder</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Breed */}
              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select breed" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Italian">Italian</SelectItem>
                        <SelectItem value="Carniolan">Carniolan</SelectItem>
                        <SelectItem value="Buckfast">Buckfast</SelectItem>
                        <SelectItem value="Russian">Russian</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Caucasian">Caucasian</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Frames */}
              <FormField
                control={form.control}
                name="frames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frames</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* To-do */}
              <FormField
                control={form.control}
                name="todo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To-do</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes or tasks for this hive"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Hive"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
