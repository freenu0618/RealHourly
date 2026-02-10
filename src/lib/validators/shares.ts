import { z } from "zod/v4";

export const CreateShareSchema = z.object({
  label: z.string().max(100).optional(),
  expiresAt: z.iso.datetime().optional(),
  showTimeDetails: z.boolean().optional().default(true),
  showCategoryBreakdown: z.boolean().optional().default(true),
  showProgress: z.boolean().optional().default(true),
  showInvoiceDownload: z.boolean().optional().default(false),
});

export const UpdateShareSchema = z.object({
  label: z.string().max(100).nullable().optional(),
  expiresAt: z.iso.datetime().nullable().optional(),
  showTimeDetails: z.boolean().optional(),
  showCategoryBreakdown: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  showInvoiceDownload: z.boolean().optional(),
});
