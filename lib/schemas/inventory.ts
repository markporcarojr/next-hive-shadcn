import { z } from "zod";

export const inventoryFormSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().int().min(0, "Quantity must be 0 or more"),
  location: z.string().min(1, "Location is required"),
});

export const inventoryApiSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1, "Name is required"),
  quantity: z.number().int().min(0, "Quantity must be 0 or more"),
  location: z.string().min(1, "Location is required"),
});

export type InventoryFormInput = z.infer<typeof inventoryFormSchema>;
export type InventoryApiInput = z.infer<typeof inventoryApiSchema>;

// Legacy export for backward compatibility
export const inventorySchema = inventoryApiSchema;
export type InventoryInput = InventoryFormInput;