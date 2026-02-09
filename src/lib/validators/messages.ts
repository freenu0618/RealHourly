import { z } from "zod/v4";

const toneEnum = z.enum(["polite", "neutral", "firm"]);
const messageLangEnum = z.enum(["ko", "en"]);

export const GenerateMessagesSchema = z.object({
  projectId: z.string().uuid(),
  alertId: z.string().uuid(),
  tones: z.array(toneEnum).optional().default(["polite", "neutral", "firm"]),
  messageLang: messageLangEnum.optional().default("ko"),
});

export type GenerateMessagesInput = z.infer<typeof GenerateMessagesSchema>;
