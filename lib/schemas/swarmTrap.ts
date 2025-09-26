// lib/schemas/swarm.ts
import { z } from "zod";

export const swarmTrapFormSchema = z.object({
  id: z.number().optional(),
  installedAt: z.date(),
  removedAt: z.date().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  notes: z.string().max(500).optional(),
  label: z.string().max(100),
});
export const swarmTrapApiSchema = z.object({
  id: z.number().optional(),
  installedAt: z.coerce.date(),
  removedAt: z.coerce.date().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  notes: z.string().max(500).optional(),
  label: z.string().max(100),
});

export type SwarmInput = z.infer<typeof swarmTrapFormSchema>;
export type SwarmApiInput = z.infer<typeof swarmTrapApiSchema>;
