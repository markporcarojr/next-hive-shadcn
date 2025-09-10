import { z } from "zod";

export const settingsSchema = z.object({
  hiveAddress: z.string().max(255).optional(),
  darkMode: z.boolean().optional(),
});

export type Settings = z.infer<typeof settingsSchema>;