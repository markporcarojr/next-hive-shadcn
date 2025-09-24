import { z } from "zod";

export const incomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().datetime("Invalid date format. Expected ISO 8601 string."),
  notes: z.string().optional(),
});

export type IncomeInput = z.infer<typeof incomeSchema>;
