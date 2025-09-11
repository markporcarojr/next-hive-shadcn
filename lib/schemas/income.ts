import { z } from "zod";

export const incomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export type IncomeInput = z.infer<typeof incomeSchema>;