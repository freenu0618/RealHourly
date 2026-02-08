import OpenAI from "openai";
import { messageJsonSchema, type LLMMessageResponse } from "./message-schema";
import { buildMessagePrompt, type MessageContext } from "./message-prompt";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

export interface GeneratedMessage {
  tone: "polite" | "neutral" | "firm";
  subject: string;
  body: string;
}

/**
 * Generate 3 billing messages using OpenAI Structured Outputs.
 * Falls back to template-based messages if LLM fails.
 */
export async function generateMessages(
  ctx: MessageContext,
): Promise<GeneratedMessage[]> {
  try {
    const model = process.env.LLM_MODEL_GENERATE || "gpt-4o-mini";
    const systemPrompt = buildMessagePrompt(ctx);

    const completion = await getOpenAI().chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate billing messages for this scope creep situation.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: messageJsonSchema,
      },
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("LLM returned empty response");

    const parsed = JSON.parse(content) as LLMMessageResponse;

    if (!parsed.messages || parsed.messages.length < 3) {
      throw new Error("LLM returned insufficient messages");
    }

    return parsed.messages.map((m) => ({
      tone: m.tone,
      subject: m.subject,
      body: m.body,
    }));
  } catch (error) {
    console.error("Message generation LLM error, using fallback:", error);
    return getFallbackMessages(ctx);
  }
}

function getFallbackMessages(ctx: MessageContext): GeneratedMessage[] {
  const hasKorean = /[가-힣]/.test(ctx.projectName);
  const overHours = Math.round(ctx.totalHours - ctx.expectedHours);
  const overPercent = Math.round(
    ((ctx.totalHours - ctx.expectedHours) / ctx.expectedHours) * 100,
  );

  if (hasKorean) {
    return [
      {
        tone: "polite",
        subject: `${ctx.projectName} 프로젝트 관련 상담 요청`,
        body: `안녕하세요,\n\n${ctx.projectName} 프로젝트를 진행하면서 당초 예상했던 ${ctx.expectedHours}시간보다 ${overHours}시간(${overPercent}%) 추가 작업이 발생했습니다. 현재 진행률은 ${ctx.progressPercent}%입니다.\n\n원활한 프로젝트 완수를 위해 추가 비용, 일정 조정, 또는 범위 조정에 대해 논의할 수 있을까요?\n\n감사합니다.`,
      },
      {
        tone: "neutral",
        subject: `${ctx.projectName} 프로젝트 범위 및 비용 조정 안내`,
        body: `안녕하세요,\n\n${ctx.projectName} 프로젝트의 현재 상황을 공유드립니다.\n\n- 예상 시간: ${ctx.expectedHours}h\n- 실제 소요: ${ctx.totalHours}h (+${overPercent}%)\n- 진행률: ${ctx.progressPercent}%\n\n초기 합의 범위를 초과한 작업이 발생하여, 다음 옵션을 제안드립니다:\n1. 추가 비용 청구\n2. 일정 연장\n3. 남은 범위 조정\n\n논의 부탁드립니다.`,
      },
      {
        tone: "firm",
        subject: `${ctx.projectName} 추가 작업에 대한 비용 청구 안내`,
        body: `안녕하세요,\n\n${ctx.projectName} 프로젝트가 당초 합의 범위를 상당히 초과했음을 알려드립니다.\n\n- 계약 시간: ${ctx.expectedHours}h\n- 실제 투입: ${ctx.totalHours}h (${overPercent}% 초과)\n- 현재 진행률: ${ctx.progressPercent}%\n\n추가 ${overHours}시간에 대한 비용 청구가 필요하며, 향후 작업 진행을 위해 범위 재조정이 필수적입니다.\n\n빠른 회신 부탁드립니다.`,
      },
    ];
  }

  return [
    {
      tone: "polite",
      subject: `Discussion about ${ctx.projectName} project scope`,
      body: `Hi,\n\nI wanted to touch base regarding the ${ctx.projectName} project. The work has exceeded our initial estimate of ${ctx.expectedHours} hours by ${overHours} hours (${overPercent}%), and we're currently at ${ctx.progressPercent}% completion.\n\nWould you be open to discussing options such as adjusting the fee, extending the timeline, or refining the project scope?\n\nThank you for your understanding.`,
    },
    {
      tone: "neutral",
      subject: `${ctx.projectName} — Scope & budget adjustment needed`,
      body: `Hi,\n\nHere's a status update on the ${ctx.projectName} project:\n\n- Estimated hours: ${ctx.expectedHours}h\n- Actual hours: ${ctx.totalHours}h (+${overPercent}%)\n- Progress: ${ctx.progressPercent}%\n\nThe project has exceeded its original scope. I'd like to propose the following options:\n1. Additional fee for extra work\n2. Timeline extension\n3. Scope reduction for remaining work\n\nLet me know your preference.`,
    },
    {
      tone: "firm",
      subject: `${ctx.projectName} — Additional billing for scope overrun`,
      body: `Hi,\n\nI need to bring to your attention that the ${ctx.projectName} project has significantly exceeded the agreed scope.\n\n- Contracted hours: ${ctx.expectedHours}h\n- Actual hours: ${ctx.totalHours}h (${overPercent}% over)\n- Current progress: ${ctx.progressPercent}%\n\nBilling for the additional ${overHours} hours is required, and a scope adjustment is necessary to proceed.\n\nPlease respond at your earliest convenience.`,
    },
  ];
}
