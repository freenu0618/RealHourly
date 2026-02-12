import OpenAI from "openai";
import { buildSystemPrompt } from "./time-log-prompt";
import { timeLogJsonSchema } from "./time-log-schema";
import type { LLMParseResponse, ProjectForMatching } from "@/types/time-log";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      timeout: 30_000,
    });
  }
  return _openai;
}

const TIER1_RETRY_DELAY_MS = 1000;
const TIER1_MAX_RETRIES = 1;

/**
 * Tier 1: Responses API (recommended for gpt-5 family)
 * Uses text.format for structured outputs, input array for messages.
 */
async function callResponsesAPI(
  model: string,
  systemPrompt: string,
  input: string,
): Promise<LLMParseResponse> {
  const response = await getOpenAI().responses.create({
    model,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input },
    ],
    text: {
      format: {
        type: "json_schema",
        name: timeLogJsonSchema.name,
        strict: timeLogJsonSchema.strict,
        schema: timeLogJsonSchema.schema,
      },
    },
    max_output_tokens: 2048,
  });

  const content = response.output_text;
  if (!content) {
    throw new Error("LLM returned empty response (Responses API)");
  }

  return JSON.parse(content) as LLMParseResponse;
}

/**
 * Tier 2: Chat Completions API (fallback for gpt-4o family)
 * Uses response_format for structured outputs, messages array.
 */
async function callChatCompletions(
  model: string,
  systemPrompt: string,
  input: string,
): Promise<LLMParseResponse> {
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
    max_tokens: 2048,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("LLM returned empty response (Chat Completions)");
  }

  return JSON.parse(content) as LLMParseResponse;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Detect if model belongs to gpt-5 family (uses Responses API). */
function isGpt5Family(model: string): boolean {
  return model.startsWith("gpt-5");
}

/**
 * 2-tier LLM parsing with different APIs per model family:
 *   Tier 1: Primary model (LLM_MODEL_PARSE) — Responses API for gpt-5, Chat Completions for gpt-4o — 1 retry
 *   Tier 2: Fallback model (LLM_MODEL_PARSE_FALLBACK) — different model + API — 1 attempt
 *
 * Default: gpt-5-mini (Tier 1) → gpt-4o-mini (Tier 2)
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

  const primaryModel = process.env.LLM_MODEL_PARSE || "gpt-5-mini";
  const fallbackModel =
    process.env.LLM_MODEL_PARSE_FALLBACK || "gpt-4o-mini";

  // ── Tier 1: Primary model with retry ──
  let lastError: unknown;
  for (let attempt = 0; attempt <= TIER1_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.info(
          `[parseTimeLog] Tier 1 retry ${attempt}/${TIER1_MAX_RETRIES} for "${primaryModel}"`,
        );
        await delay(TIER1_RETRY_DELAY_MS * attempt);
      }

      const callFn = isGpt5Family(primaryModel)
        ? callResponsesAPI
        : callChatCompletions;
      return await callFn(primaryModel, systemPrompt, input);
    } catch (err) {
      lastError = err;
      console.warn(
        `[parseTimeLog] Tier 1 "${primaryModel}" attempt ${attempt + 1} failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  // ── Tier 2: Fallback model (different model + API) ──
  if (fallbackModel !== primaryModel) {
    try {
      console.info(
        `[parseTimeLog] Tier 2 fallback to "${fallbackModel}"`,
      );
      const callFn = isGpt5Family(fallbackModel)
        ? callResponsesAPI
        : callChatCompletions;
      return await callFn(fallbackModel, systemPrompt, input);
    } catch (fallbackErr) {
      console.error(
        `[parseTimeLog] Tier 2 "${fallbackModel}" also failed:`,
        fallbackErr instanceof Error ? fallbackErr.message : fallbackErr,
      );
      throw fallbackErr;
    }
  }

  // Both models are the same and all retries exhausted
  throw lastError;
}
