// lib/schemas/swarm.ts
import { z } from "zod";

export const swarmTrapSchema = z.object({
  id: z.number().optional(),
  installedAt: z.string().datetime("Invalid date format. Expected ISO 8601 string."),
  removedAt: z.string().datetime("Invalid date format. Expected ISO 8601 string.").optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  notes: z.string().max(500).optional(),
  label: z.string().max(100),
});

export type SwarmInput = z.infer<typeof swarmTrapSchema>;
