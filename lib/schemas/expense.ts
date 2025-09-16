// lib/schemas/expense.ts

import { z } from "zod";

// Prisma Decimal type is usually handled as string or number in input schemas
export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.coerce.date(),
  item: z.string().min(1, "Item is required"),
  notes: z.string().optional(),
});

export type ExpenseInput = z.input<typeof expenseSchema>;
