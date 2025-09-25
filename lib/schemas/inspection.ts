import { z } from "zod";

export const inspectionFormSchema = z.object({
  id: z.number().int().optional(),
  hiveId: z.number().int().min(1),
  temperament: z.string().min(1),
  hiveStrength: z.number().int().min(0),
  inspectionDate: z.date(),
  inspectionImage: z.string().optional(),
  queen: z.boolean().optional(),
  queenCell: z.boolean().optional(),
  brood: z.boolean().optional(),
  disease: z.boolean().optional(),
  eggs: z.boolean().optional(),
  pests: z.string().optional(),
  feeding: z.string().optional(),
  treatments: z.string().optional(),
  inspectionNote: z.string().optional(),
  weatherCondition: z.string().optional(),
  weatherTemp: z.string().optional(),
});

export const inspectionApiSchema = z.object({
  id: z.number().int().optional(),
  hiveId: z.number().int().min(1),
  temperament: z.string().min(1),
  hiveStrength: z.number().int().min(0),
  inspectionDate: z.coerce.date(),
  inspectionImage: z.string().optional(),
  queen: z.boolean().optional(),
  queenCell: z.boolean().optional(),
  brood: z.boolean().optional(),
  disease: z.boolean().optional(),
  eggs: z.boolean().optional(),
  pests: z.string().optional(),
  feeding: z.string().optional(),
  treatments: z.string().optional(),
  inspectionNote: z.string().optional(),
  weatherCondition: z.string().optional(),
  weatherTemp: z.string().optional(),
});

export type InspectionApiInput = z.infer<typeof inspectionApiSchema>;
export type InspectionInput = z.infer<typeof inspectionFormSchema>;
export type InspectionWithHive = InspectionInput & {
  hive: {
    hiveNumber: number;
  };
};
