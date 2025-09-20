"use client";

import MapPicker from "@/components/map-picker";
import { HiveInput, hiveSchema } from "@/lib/schemas/hive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { IconCalendar } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
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
      latitude: 42.78,
      longitude: -83.77,
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
      <h2 className="text-3xl font-bold tracking-tight mb-6">Add New Hive</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-2 block">Hive Location</Label>
            <MapPicker
              initialLat={form.watch("latitude")}
              initialLng={form.watch("longitude")}
              onSelect={(lat, lng) => {
                form.setValue("latitude", lat);
                form.setValue("longitude", lng);
              }}
            />
          </div>

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
                        variant="outline"
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
                        <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
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

          <FormField
            control={form.control}
            name="hiveNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hive Number</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hiveSource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hive Source</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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

          <FormField
            control={form.control}
            name="hiveImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hive Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Optional image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="broodBoxes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brood Boxes</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="superBoxes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Super Boxes</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="hiveStrength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hive Strength (0-100)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    max="100"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="queenColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Queen Color</FormLabel>
                  <FormControl>
                    <Input placeholder="Queen color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="queenAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Queen Age</FormLabel>
                  <FormControl>
                    <Input placeholder="Queen age" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="queenExcluder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Queen Excluder</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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

          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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

          <FormField
            control={form.control}
            name="frames"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frames</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="todo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To-do</FormLabel>
                <FormControl>
                  <Textarea placeholder="Notes or tasks for this hive" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {loading ? "Saving..." : "Save Hive"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
