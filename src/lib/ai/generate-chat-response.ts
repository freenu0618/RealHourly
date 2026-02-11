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

  // Keep last 5 conversation pairs (10 messages) to save token budget
  const recentHistory = conversationHistory.slice(-10);

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

  // First attempt
  const result = await callLLM(model, messages);
  if (result) return result;

  // Retry with reduced context (fewer activities, shorter history)
  console.warn("[AI Chat] Retrying with reduced context...");
  const reducedContext = chatContextToPromptString({
    ...context,
    recentActivity: context.recentActivity.slice(0, 5),
  });
  const reducedMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: buildChatSystemPrompt(reducedContext) },
    ...recentHistory.slice(-4),
    { role: "user", content: userMessage },
  ];

  const retryResult = await callLLM(model, reducedMessages);
  if (retryResult) return retryResult;

  return FALLBACK_MESSAGE;
}

async function callLLM(
  model: string,
  messages: OpenAI.ChatCompletionMessageParam[],
): Promise<string | null> {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model,
      messages,
      max_completion_tokens: 2000,
    });

    const choice = completion.choices[0];
    const content = choice?.message?.content;

    if (choice?.finish_reason && choice.finish_reason !== "stop") {
      console.warn(
        `[AI Chat] Non-stop finish_reason=${choice.finish_reason}, usage=${JSON.stringify(completion.usage)}`,
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
    console.error("[AI Chat] API call failed:", error);
    return null;
  }
}
