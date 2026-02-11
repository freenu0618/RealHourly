import { z } from "zod/v4";

const aiActionTypeEnum = z.enum([
  "briefing",
  "scope_alert",
  "billing_suggestion",
  "profitability_warning",
  "followup_reminder",
  "weekly_report",
]);

const aiActionStatusEnum = z.enum([
  "pending",
  "approved",
  "dismissed",
  "executed",
]);

export const CreateAiActionSchema = z.object({
  projectId: z.string().uuid().nullable().optional().default(null),
  type: aiActionTypeEnum,
  title: z.string().min(1).max(500),
  message: z.string().max(5000).nullable().optional().default(null),
  payload: z.record(z.string(), z.unknown()).nullable().optional().default(null),
});

export const UpdateAiActionSchema = z.object({
  status: z.enum(["approved", "dismissed"]),
});

export const AiActionsQuerySchema = z.object({
  status: aiActionStatusEnum.optional(),
});

export type AiActionType = z.infer<typeof aiActionTypeEnum>;
export type AiActionStatus = z.infer<typeof aiActionStatusEnum>;
export type CreateAiActionInput = z.infer<typeof CreateAiActionSchema>;
export type UpdateAiActionInput = z.infer<typeof UpdateAiActionSchema>;
