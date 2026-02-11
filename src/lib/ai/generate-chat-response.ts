import OpenAI from "openai";
import { buildChatContext, chatContextToPromptString } from "./chat-context";
import { buildChatSystemPrompt } from "./chat-prompt";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

const FALLBACK_MESSAGE =
  "죄송합니다, 일시적으로 답변을 생성하지 못했어요. 잠시 후 다시 시도해주세요.";

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

  // Keep last 10 conversation pairs (20 messages)
  const recentHistory = conversationHistory.slice(-20);

  try {
    const model = process.env.LLM_MODEL_GENERATE || "gpt-4o-mini";

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

    const completion = await getOpenAI().chat.completions.create({
      model,
      messages,
      max_completion_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("LLM returned empty response");

    return content.trim();
  } catch (error) {
    console.error("[AI Chat] Generation failed:", error);
    return FALLBACK_MESSAGE;
  }
}
