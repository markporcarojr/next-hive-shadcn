// lib/schemas/hive.ts
import { z } from "zod";

export const hiveFormSchema = z.object({
  breed: z.string().optional(),
  broodBoxes: z.number().int().nonnegative().optional(),
  frames: z.number().int().nonnegative().optional(),
  hiveDate: z.date(),
  hiveImage: z.string().optional(),
  hiveNumber: z.number().int().min(1, "Hive number is required"),
  hiveSource: z.string().min(1, "Hive source is required"),
  hiveStrength: z.number().int().min(0).max(100).optional(),
  id: z.number().int().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  queenAge: z.string().optional(),
  queenColor: z.string().optional(),
  queenExcluder: z.string().optional(),
  superBoxes: z.number().int().nonnegative().optional(),
  todo: z.string().optional(),
});

export const hiveApiSchema = z.object({
  breed: z.string().optional(),
  broodBoxes: z.number().int().nonnegative().optional(),
  frames: z.number().int().nonnegative().optional(),
  hiveDate: z.coerce.date(),
  hiveImage: z.string().optional(),
  hiveNumber: z.number().int().min(1, "Hive number is required"),
  hiveSource: z.string().min(1, "Hive source is required"),
  hiveStrength: z.number().int().min(0).max(100).optional(),
  id: z.number().int().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  queenAge: z.string().optional(),
  queenColor: z.string().optional(),
  queenExcluder: z.string().optional(),
  superBoxes: z.number().int().nonnegative().optional(),
  todo: z.string().optional(),
});
export type HiveInput = z.infer<typeof hiveFormSchema>;
export type HiveApiInput = z.infer<typeof hiveApiSchema>;
