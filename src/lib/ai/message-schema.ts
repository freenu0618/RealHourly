/**
 * JSON Schema for OpenAI Structured Outputs — billing message generation.
 * Produces 3 messages (polite, neutral, firm) with subject + body.
 */
export const messageJsonSchema = {
  name: "billing_messages",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      messages: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            tone: {
              type: "string" as const,
              enum: ["polite", "neutral", "firm"],
              description: "The tone of the message",
            },
            subject: {
              type: "string" as const,
              description:
                "Email/message subject line, concise and professional",
            },
            body: {
              type: "string" as const,
              description:
                "Full message body with specific numbers and suggested options",
            },
          },
          required: ["tone", "subject", "body"],
          additionalProperties: false,
        },
      },
    },
    required: ["messages"],
    additionalProperties: false,
  },
} as const;

/** TypeScript type for the LLM output */
export interface LLMMessageResponse {
  messages: {
    tone: "polite" | "neutral" | "firm";
    subject: string;
    body: string;
  }[];
}
