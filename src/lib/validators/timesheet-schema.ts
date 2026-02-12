import { z } from "zod/v4";

export const CreateTimesheetSchema = z.object({
  projectId: z.string().uuid(),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

export const SubmitTimesheetSchema = z.object({
  reviewerEmail: z.string().email().optional(),
});

export const ReviewTimesheetSchema = z.object({
  action: z.enum(["approved", "rejected"]),
  note: z.string().max(2000).optional(),
  reviewerEmail: z.string().email().optional(),
});

export const TimesheetListQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).optional(),
});

export type CreateTimesheetInput = z.infer<typeof CreateTimesheetSchema>;
export type SubmitTimesheetInput = z.infer<typeof SubmitTimesheetSchema>;
export type ReviewTimesheetInput = z.infer<typeof ReviewTimesheetSchema>;
export type TimesheetListQuery = z.infer<typeof TimesheetListQuerySchema>;
