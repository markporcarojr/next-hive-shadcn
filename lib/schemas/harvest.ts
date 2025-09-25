// lib/schemas/harvest.ts
import { z } from "zod";

export const harvestFormSchema = z.object({
  id: z.number().optional(),
  harvestType: z.string().min(1),
  harvestAmount: z.number().min(1),
  harvestDate: z.date(),
});

export type HarvestInput = z.infer<typeof harvestFormSchema>;

export const harvestApiSchema = z.object({
  id: z.number().optional(),
  harvestType: z.string().min(1),
  harvestAmount: z.number().min(1),
  harvestDate: z.coerce.date(),
});

export type HarvestApiInput = z.infer<typeof harvestApiSchema>;
