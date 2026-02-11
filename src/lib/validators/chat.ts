import { z } from "zod/v4";

export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(500),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});

export type ChatMessageInput = z.infer<typeof ChatMessageSchema>;
