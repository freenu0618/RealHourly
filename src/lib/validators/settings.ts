import { z } from "zod/v4";

export const UpdateProfileSchema = z.object({
  displayName: z.string().max(100).nullable().optional(),
});

export const UpdatePreferencesSchema = z.object({
  defaultCurrency: z.enum(["USD", "KRW", "EUR", "GBP", "JPY"]).optional(),
  hourlyGoal: z.number().int().min(1).max(24).nullable().optional(),
  timezone: z.string().min(1).max(100).optional(),
  locale: z.enum(["ko", "en"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof UpdatePreferencesSchema>;
