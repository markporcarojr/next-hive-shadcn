import { z } from "zod";

export const incomeFormSchema = z.object({
  id: z.number().optional(), // useful for edit forms
  source: z.string().min(1, "Source is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.date(),
  notes: z.string().optional(),
  invoiceId: z.number().optional(), // ✅ match Prisma (Int?)
});
export const incomeApiSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.coerce.date(),
  notes: z.string().optional(),
  invoiceId: z.string().optional(),
});

export type IncomeInput = z.infer<typeof incomeFormSchema>;
export type IncomeApiInput = z.infer<typeof incomeApiSchema>;
