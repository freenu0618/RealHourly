import { z } from "zod/v4";

const toneEnum = z.enum(["polite", "neutral", "firm"]);

export const GenerateMessagesSchema = z.object({
  projectId: z.string().uuid(),
  alertId: z.string().uuid(),
  tones: z.array(toneEnum).optional().default(["polite", "neutral", "firm"]),
});

export type GenerateMessagesInput = z.infer<typeof GenerateMessagesSchema>;
