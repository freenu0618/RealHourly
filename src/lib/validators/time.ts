import { z } from "zod/v4";

const categoryEnum = z.enum([
  "planning",
  "design",
  "development",
  "meeting",
  "revision",
  "admin",
  "email",
  "research",
  "other",
]);

const intentEnum = z.enum(["done", "planned"]);

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const ParseTimeSchema = z.object({
  input: z.string().min(1).max(2000),
  userTimezone: z.string().optional().default("Asia/Seoul"),
});

const SaveTimeEntrySchema = z.object({
  projectId: z.string().uuid(),
  date: z.string().regex(datePattern, "Date must be YYYY-MM-DD"),
  minutes: z.number().int().min(1).max(1440),
  category: categoryEnum,
  intent: intentEnum.optional().default("done"),
  taskDescription: z.string(),
  sourceText: z.string().optional(),
  issues: z.array(z.string()).optional().default([]),
});

export const SaveTimeSchema = z.object({
  entries: z.array(SaveTimeEntrySchema).min(1),
});

export type ParseTimeInput = z.infer<typeof ParseTimeSchema>;
export type SaveTimeInput = z.infer<typeof SaveTimeSchema>;
export type SaveTimeEntryInput = z.infer<typeof SaveTimeEntrySchema>;
