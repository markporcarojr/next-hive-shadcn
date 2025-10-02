import { z } from "zod";

// 1. Product enum
export const PRODUCT_TYPE_VALUES = [
  "honey",
  "honey bulk",
  "candles small",
  "candles med",
  "candles lg",
  "morel candle $8",
  "morel candle $10",
  "honey bundle",
  "misc",
] as const;

export const ProductTypeEnum = z.enum(PRODUCT_TYPE_VALUES);

// 2. Product types list for dropdowns
export const PRODUCT_TYPES = PRODUCT_TYPE_VALUES.map((value) => ({
  value,
  label: value
    .split(" ")
    .map((word) =>
      word.startsWith("$") ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" "),
}));

// 3. Invoice item schema
export const invoiceItemSchema = z.object({
  product: ProductTypeEnum,
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

// 4. Invoice form schema (frontend)
export const invoiceFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  date: z.date(),
  email: z.string().email("Invalid email format").optional(),
  notes: z.string().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  total: z.number().nonnegative(),
});

// 5. Invoice API schema (backend)
export const invoiceApiSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  date: z.coerce.date(), // 🔧 accepts ISO strings
  email: z.string().email("Invalid email format").optional(),
  notes: z.string().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  total: z.number().nonnegative(),
  id: z.string().optional(), // for updates
});

// 6. Types
export type InvoiceInput = z.infer<typeof invoiceFormSchema>;
export type InvoiceApiInput = z.infer<typeof invoiceApiSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
