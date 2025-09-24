// lib/schemas/harvest.ts
import { z } from "zod";

export const harvestSchema = z.object({
  id: z.number().optional(),
  harvestType: z.string().min(1),
  harvestAmount: z.number().min(1),
  harvestDate: z.string().min(1, "Date is required"),
});

export type HarvestInput = z.infer<typeof harvestSchema>;
