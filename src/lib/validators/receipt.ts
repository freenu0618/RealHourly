import { z } from "zod/v4";

export const ParseReceiptRequestSchema = z.object({
  image: z.string().min(1),
  projectId: z.string().uuid(),
  userCurrency: z.enum(["KRW", "USD", "EUR", "GBP", "JPY"]),
});

export type ParseReceiptRequest = z.infer<typeof ParseReceiptRequestSchema>;

export const ParsedReceiptSchema = z.object({
  amount: z.number(),
  currency: z.enum(["KRW", "USD", "EUR", "GBP", "JPY"]),
  date: z.union([z.string(), z.null()]),
  costType: z.enum(["platform_fee", "tax", "tool", "contractor", "misc"]),
  notes: z.string(),
  confidence: z.number(),
  rawText: z.string(),
});

export type ParsedReceipt = z.infer<typeof ParsedReceiptSchema>;
