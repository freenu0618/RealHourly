import { z } from "zod/v4";

export const GenerateInvoiceSchema = z.object({
  type: z.enum(["estimate", "invoice"]),
  from: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().optional(),
    bankInfo: z.string().optional(),
  }),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  notes: z.string().optional(),
  locale: z.enum(["ko", "en"]).optional(),
});

export type GenerateInvoiceInput = z.infer<typeof GenerateInvoiceSchema>;
