import { CATEGORIES } from "@/types/time-log";

/**
 * JSON Schema for OpenAI Structured Outputs (strict mode).
 * Matches the LLMParseResponse interface from types/time-log.ts.
 */
export const timeLogJsonSchema = {
  name: "time_log_parse",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      entries: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            project_name_raw: {
              type: "string" as const,
              description:
                "The project/client name exactly as the user wrote it",
            },
            task_description: {
              type: "string" as const,
              description:
                "Brief description of the task performed (e.g. 기획서 작성, logo feedback)",
            },
            date: {
              type: ["string", "null"] as const,
              description:
                "YYYY-MM-DD if clear. Relative expressions like 오늘/어제/today/yesterday are allowed. null if ambiguous.",
            },
            duration_minutes: {
              type: ["integer", "null"] as const,
              description:
                "Duration in minutes (1-1440). null if the user did not mention any time.",
            },
            duration_source: {
              type: "string" as const,
              enum: ["explicit", "ambiguous", "missing"],
              description:
                "explicit = user stated exact time, ambiguous = vague estimate, missing = no time info at all",
            },
            category: {
              type: "string" as const,
              enum: [...CATEGORIES],
              description: "Best matching work category",
            },
            intent: {
              type: "string" as const,
              enum: ["done", "planned"],
              description:
                "done = past/completed work, planned = future/upcoming work",
            },
          },
          required: [
            "project_name_raw",
            "task_description",
            "date",
            "duration_minutes",
            "duration_source",
            "category",
            "intent",
          ],
          additionalProperties: false,
        },
      },
    },
    required: ["entries"],
    additionalProperties: false,
  },
} as const;
