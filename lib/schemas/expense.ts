// lib/schemas/expense.ts
import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  item: z.string().min(1, "Item is required"),
  notes: z.string().optional(),
});

// ✅ Correct type: parsed/output values
export type ExpenseInput = z.infer<typeof expenseSchema>;
