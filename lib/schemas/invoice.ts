import { z } from "zod";

// 1. Literal tuple for enum values
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

// 2. Create the Zod enum using the tuple
export const ProductTypeEnum = z.enum(PRODUCT_TYPE_VALUES);

// 3. Create label/value pair list for dropdowns
export const PRODUCT_TYPES = PRODUCT_TYPE_VALUES.map((value) => ({
  value,
  label: value
    .split(" ")
    .map((word) =>
      word.startsWith("$") ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" "),
}));

// 4. Invoice item schema using the enum
export const invoiceItemSchema = z.object({
  product: ProductTypeEnum,
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

// 5. Full invoice form schema
export const invoiceFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  date: z.date(),
  email: z.email("Invalid email format").optional(),
  notes: z.string().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  total: z.number().nonnegative(),
});

// 6. Full invoice API schema
export const invoiceApiSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  date: z.coerce.date(),
  email: z.email("Invalid email format").optional(),
  notes: z.string().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  total: z.number().nonnegative(),
});

// 7. Types
export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;
export type InvoiceApiInput = z.infer<typeof invoiceApiSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

// Legacy alias for backward compatibility
export const invoiceSchema = invoiceFormSchema;
export type InvoiceInput = InvoiceFormInput;
