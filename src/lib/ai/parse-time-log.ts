import OpenAI from "openai";
import { buildSystemPrompt } from "./time-log-prompt";
import { timeLogJsonSchema } from "./time-log-schema";
import type { LLMParseResponse, ProjectForMatching } from "@/types/time-log";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

/**
 * Call the LLM to parse natural language time log input.
 * Uses OpenAI Structured Outputs (response_format json_schema, strict: true).
 * No retry in P0 — failure propagates to frontend which shows manual form.
 */
export async function parseTimeLog(
  input: string,
  activeProjects: ProjectForMatching[],
  preferredProjectId?: string,
  userTimezone = "Asia/Seoul",
): Promise<LLMParseResponse> {
  const systemPrompt = buildSystemPrompt(
    activeProjects,
    preferredProjectId,
    userTimezone,
  );

  const model = process.env.LLM_MODEL_PARSE || "gpt-4o-mini";

  const completion = await getOpenAI().chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input },
    ],
    response_format: {
      type: "json_schema",
      json_schema: timeLogJsonSchema,
    },
    temperature: 0.1,
    max_tokens: 2048,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("LLM returned empty response");
  }

  return JSON.parse(content) as LLMParseResponse;
}
