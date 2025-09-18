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
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

// 5. Full invoice schema
export const invoiceSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  date: z.coerce.date(),
  email: z.string().email("Invalid email format").optional(),
  notes: z.string().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  total: z.coerce.number().nonnegative(),
});

// 6. Types
export type InvoiceInput = z.input<typeof invoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
