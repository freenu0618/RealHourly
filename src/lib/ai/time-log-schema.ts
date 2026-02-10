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
      progress_hint: {
        type: ["object", "null"] as const,
        description:
          "If the user mentions project completion status (e.g. '완료', '끝남', '80%'), include a hint. null if not detected.",
        properties: {
          detected: {
            type: "boolean" as const,
            description: "Whether progress-related language was detected",
          },
          suggested_progress: {
            type: ["integer", "null"] as const,
            description: "Suggested progress 0-100. null if unclear.",
          },
          reason: {
            type: "string" as const,
            description:
              "Brief reason for the suggestion (e.g. '사용자가 완료라고 언급')",
          },
          project_name_raw: {
            type: ["string", "null"] as const,
            description:
              "The project name the progress refers to, if identifiable",
          },
        },
        required: [
          "detected",
          "suggested_progress",
          "reason",
          "project_name_raw",
        ],
        additionalProperties: false,
      },
    },
    required: ["entries", "progress_hint"],
    additionalProperties: false,
  },
} as const;
