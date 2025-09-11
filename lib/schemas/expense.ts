import { z } from "zod";

// Prisma Decimal type is usually handled as string or number in input schemas
export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  createdAt: z.coerce.date().optional(), // auto-generated, optional for input
  date: z.coerce.date(),
  id: z.number().int().optional(), // id is auto-incremented, optional for input
  item: z.string().min(1, "Item is required"),
  notes: z.string().optional(),
  updatedAt: z.coerce.date().optional(), // auto-generated, optional for input
});

export type ExpenseInput = z.infer<typeof expenseSchema>;