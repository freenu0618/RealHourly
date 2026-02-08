import { z } from "zod/v4";

const costTypeEnum = z.enum([
  "platform_fee",
  "tax",
  "tool",
  "contractor",
  "misc",
]);

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const CreateCostSchema = z.object({
  amount: z.number().min(0),
  costType: costTypeEnum,
  date: z.string().regex(datePattern, "Date must be YYYY-MM-DD").optional(),
  notes: z.string().optional(),
});

export const UpdateCostSchema = CreateCostSchema.partial();

export type CreateCostInput = z.infer<typeof CreateCostSchema>;
export type UpdateCostInput = z.infer<typeof UpdateCostSchema>;
