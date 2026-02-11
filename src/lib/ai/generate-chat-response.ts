import OpenAI from "openai";
import {
  buildChatContext,
  chatContextToPromptString,
  type ChatContext,
} from "./chat-context";
import { buildChatSystemPrompt } from "./chat-prompt";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

export async function generateChatResponse(
  userId: string,
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const context = await buildChatContext(userId);

  if (context.totalActiveProjects === 0 && context.recentActivity.length === 0) {
    return "아직 프로젝트나 작업 기록이 없어요. 먼저 프로젝트를 만들고 시간을 기록해보세요! 📝";
  }

  const contextString = chatContextToPromptString(context);
  const systemPrompt = buildChatSystemPrompt(contextString);

  // Keep last 5 conversation pairs (10 messages) to save token budget
  const recentHistory = conversationHistory.slice(-10);

  const primaryModel = process.env.LLM_MODEL_GENERATE || "gpt-4o-mini";
  const fallbackModel = "gpt-4o-mini";

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...recentHistory.map(
      (m) =>
        ({
          role: m.role,
          content: m.content,
        }) as OpenAI.ChatCompletionMessageParam,
    ),
    { role: "user", content: userMessage },
  ];

  // Attempt 1: primary model with full context
  const result = await callLLM(primaryModel, messages);
  if (result) return result;

  // Attempt 2: fallback model with reduced context + no history
  console.warn("[AI Chat] Primary model failed, trying fallback model...");
  const reducedContext = chatContextToPromptString({
    ...context,
    recentActivity: context.recentActivity.slice(0, 5),
  });
  const fallbackMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: buildChatSystemPrompt(reducedContext) },
    { role: "user", content: userMessage },
  ];

  const fallbackResult = await callLLM(fallbackModel, fallbackMessages, true);
  if (fallbackResult) return fallbackResult;

  // Attempt 3: data-driven response (no LLM)
  console.warn("[AI Chat] All LLM attempts failed, using data-driven fallback");
  return buildDataDrivenResponse(context, userMessage);
}

async function callLLM(
  model: string,
  messages: OpenAI.ChatCompletionMessageParam[],
  useLegacyParam = false,
): Promise<string | null> {
  try {
    const params: OpenAI.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages,
    };

    // gpt-4o family uses max_tokens, gpt-5 family uses max_completion_tokens
    if (useLegacyParam || model.startsWith("gpt-4")) {
      params.max_tokens = 2000;
    } else {
      params.max_completion_tokens = 2000;
    }

    const completion = await getOpenAI().chat.completions.create(params);

    const choice = completion.choices[0];
    const content = choice?.message?.content;

    if (choice?.finish_reason && choice.finish_reason !== "stop") {
      console.warn(
        `[AI Chat] finish_reason=${choice.finish_reason}, model=${model}, usage=${JSON.stringify(completion.usage)}`,
      );
    }

    if (!content || content.trim() === "") {
      console.error(
        `[AI Chat] Empty content. finish_reason=${choice?.finish_reason}, model=${model}, usage=${JSON.stringify(completion.usage)}`,
      );
      return null;
    }

    return content.trim();
  } catch (error) {
    console.error(`[AI Chat] ${model} call failed:`, error);
    return null;
  }
}

function buildDataDrivenResponse(ctx: ChatContext, query: string): string {
  const q = query.toLowerCase();

  // Profitability comparison
  if (q.includes("수익") || q.includes("비교") || q.includes("profit")) {
    const sorted = [...ctx.projects]
      .filter((p) => p.realHourly !== null)
      .sort((a, b) => (b.realHourly ?? 0) - (a.realHourly ?? 0));

    if (sorted.length === 0) {
      return "아직 실제 시급이 계산된 프로젝트가 없어요. 시간을 더 기록해보세요!";
    }

    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const lines = [`프로젝트 수익성 비교 결과입니다.`];
    lines.push(
      `가장 높은 실제 시급: ${best.name} — ${best.currency} ${best.realHourly?.toLocaleString()}/h (명목: ${best.nominalHourly?.toLocaleString()}/h)`,
    );
    if (sorted.length > 1) {
      lines.push(
        `가장 낮은 실제 시급: ${worst.name} — ${worst.currency} ${worst.realHourly?.toLocaleString()}/h (명목: ${worst.nominalHourly?.toLocaleString()}/h)`,
      );
    }
    lines.push(
      `전체 평균 실제 시급: ${ctx.avgRealHourly?.toLocaleString() ?? "N/A"}/h`,
    );
    if (best.realHourly && best.nominalHourly) {
      const gap = Math.round(
        ((best.nominalHourly - best.realHourly) / best.nominalHourly) * 100,
      );
      if (gap > 0) {
        lines.push(
          `${best.name}도 명목 대비 ${gap}% 낮은 실제 시급이에요. 숨은 비용을 확인해보세요!`,
        );
      }
    }
    return lines.join("\n");
  }

  // Weekly summary
  if (q.includes("이번 주") || q.includes("요약") || q.includes("week")) {
    const lines = [`이번 주 작업 요약입니다.`];
    lines.push(`총 작업 시간: ${ctx.weeklyHours}시간`);
    lines.push(`활성 프로젝트: ${ctx.totalActiveProjects}개`);
    if (ctx.activeAlertCount > 0) {
      lines.push(`활성 경고: ${ctx.activeAlertCount}개 — 확인이 필요해요!`);
    }

    const projectSummaries = ctx.projects
      .filter((p) => p.totalHours > 0)
      .slice(0, 5)
      .map((p) => `  - ${p.name}: ${p.totalHours}h (진행 ${p.progressPercent}%)`)
      .join("\n");
    if (projectSummaries) {
      lines.push(`프로젝트별 현황:\n${projectSummaries}`);
    }
    return lines.join("\n");
  }

  // Scope creep risk
  if (q.includes("스코프") || q.includes("위험") || q.includes("scope")) {
    const atRisk = ctx.projects.filter(
      (p) => p.hasActiveAlert || p.revisionPercent >= 30,
    );
    if (atRisk.length === 0) {
      return "현재 스코프 크리프 위험이 있는 프로젝트가 없어요. 잘 관리하고 계시네요! 👍";
    }
    const lines = [`스코프 크리프 주의 프로젝트:`];
    for (const p of atRisk) {
      const reasons = [];
      if (p.hasActiveAlert) reasons.push("경고 활성");
      if (p.revisionPercent >= 30) reasons.push(`수정 비율 ${p.revisionPercent}%`);
      lines.push(`- ${p.name}: ${reasons.join(", ")}`);
    }
    return lines.join("\n");
  }

  // Default: general summary
  const lines = [
    `현재 ${ctx.totalActiveProjects}개 프로젝트가 진행 중이에요.`,
    `총 작업 시간: ${ctx.totalHours}시간, 이번 주: ${ctx.weeklyHours}시간`,
    `평균 실제 시급: ${ctx.avgRealHourly?.toLocaleString() ?? "N/A"}/h`,
  ];
  if (ctx.activeAlertCount > 0) {
    lines.push(`${ctx.activeAlertCount}개 경고가 있어요. 확인해보세요!`);
  }
  lines.push(`더 구체적인 질문을 해주시면 자세히 분석해드릴게요.`);
  return lines.join("\n");
}
