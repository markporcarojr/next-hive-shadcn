// lib/schemas/expense.ts
import { z } from "zod";

// Schema for form input (what react-hook-form sees)
export const expenseFormSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  date: z.date(), // Direct Date type for the form
  item: z.string().min(1, "Item is required"),
  notes: z.string().optional(),
  id: z.number().optional(), // id is optional for creation
});

// Schema for API input (with coercion for server-side validation)
export const expenseApiSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  date: z.coerce.date(), // Coerce from string/ISO date
  item: z.string().min(1, "Item is required"),
  notes: z.string().optional(),
  id: z.number().optional(), // id is optional for creation
});

// Types
export type ExpenseFormInput = z.infer<typeof expenseFormSchema>;
export type ExpenseApiInput = z.infer<typeof expenseApiSchema>;
