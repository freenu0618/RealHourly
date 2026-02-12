import OpenAI from "openai";

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      timeout: 30_000,
    });
  }
  return _openai;
}

/** Detect if model belongs to gpt-5 family (uses Responses API). */
export function isGpt5Family(model: string): boolean {
  return model.startsWith("gpt-5");
}

// ─── Structured output (json_schema) ───

interface JsonSchemaSpec {
  name: string;
  strict: boolean;
  schema: Record<string, unknown>;
}

export async function callStructuredLLM<T>(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  jsonSchema: JsonSchemaSpec,
  maxTokens = 2048,
): Promise<T> {
  if (isGpt5Family(model)) {
    const response = await getOpenAI().responses.create({
      model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      text: {
        format: {
          type: "json_schema",
          name: jsonSchema.name,
          strict: jsonSchema.strict,
          schema: jsonSchema.schema,
        },
      },
      max_output_tokens: maxTokens,
    });
    const content = response.output_text;
    if (!content) throw new Error("LLM returned empty response");
    return JSON.parse(content) as T;
  }

  // Chat Completions API for gpt-4o family
  const completion = await getOpenAI().chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: jsonSchema,
    },
    max_tokens: maxTokens,
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("LLM returned empty response");
  return JSON.parse(content) as T;
}

// ─── Free-text generation (no structured output) ───

export async function callTextLLM(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 2000,
): Promise<string | null> {
  if (isGpt5Family(model)) {
    const response = await getOpenAI().responses.create({
      model,
      instructions: systemPrompt,
      input: userPrompt,
      max_output_tokens: maxTokens,
    });
    const content = response.output_text;
    return content?.trim() || null;
  }

  // Chat Completions API for gpt-4o family
  const completion = await getOpenAI().chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxTokens,
  });
  const content = completion.choices[0]?.message?.content;
  return content?.trim() || null;
}

// ─── Multi-turn chat (with conversation history) ───

export async function callChatLLM(
  model: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  maxTokens = 2000,
): Promise<string | null> {
  if (isGpt5Family(model)) {
    const response = await getOpenAI().responses.create({
      model,
      input: messages.map((m) => ({ role: m.role, content: m.content })),
      max_output_tokens: maxTokens,
    });
    const content = response.output_text;
    return content?.trim() || null;
  }

  // Chat Completions API for gpt-4o family
  const completion = await getOpenAI().chat.completions.create({
    model,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    max_tokens: maxTokens,
  });
  const content = completion.choices[0]?.message?.content;
  return content?.trim() || null;
}

// ─── JSON object mode (less strict than json_schema) ───

export async function callJsonObjectLLM<T>(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1000,
): Promise<T | null> {
  if (isGpt5Family(model)) {
    const response = await getOpenAI().responses.create({
      model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      text: { format: { type: "json_object" } },
      max_output_tokens: maxTokens,
    });
    const content = response.output_text;
    if (!content) return null;
    return JSON.parse(content) as T;
  }

  // Chat Completions API for gpt-4o family
  const completion = await getOpenAI().chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: maxTokens,
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) return null;
  return JSON.parse(content) as T;
}
