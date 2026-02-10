import { z } from "zod/v4";

const currencyEnum = z.enum(["USD", "KRW", "EUR", "GBP", "JPY"]);
const platformPresetEnum = z.enum([
  "none",
  "upwork",
  "fiverr",
  "kmong",
  "custom",
]);

export const PRESET_RATES: Record<string, number> = {
  none: 0,
  upwork: 0.1,
  fiverr: 0.2,
  kmong: 0.2,
};

export const CreateProjectSchema = z.object({
  clientId: z.string().uuid().nullable().optional().default(null),
  clientName: z.string().max(200).optional(),
  name: z.string().min(1).max(200),
  aliases: z.array(z.string()).optional().default([]),
  expectedFee: z.number().min(0),
  expectedHours: z.number().min(0),
  currency: currencyEnum,
  platformFeePreset: platformPresetEnum,
  platformFeeRate: z.number().min(0).max(1).optional(),
  taxEnabled: z.boolean(),
  taxRate: z.number().min(0).max(1).optional().default(0.033),
  fixedCostAmount: z.number().min(0).optional(),
  fixedCostType: z.enum(["tool", "misc"]).optional(),
  agreedRevisionCount: z.number().int().min(0).max(50).nullable().optional(),
});

const statusEnum = z.enum(["active", "completed", "paused", "cancelled"]);

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  clientId: z.string().uuid().nullable().optional(),
  aliases: z.array(z.string()).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  expectedFee: z.number().min(0).optional(),
  expectedHours: z.number().min(0).optional(),
  currency: currencyEnum.optional(),
  platformFeeRate: z.number().min(0).max(1).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  progressPercent: z.number().int().min(0).max(100).optional(),
  status: statusEnum.optional(),
  agreedRevisionCount: z.number().int().min(0).max(50).nullable().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
