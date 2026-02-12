import { callJsonObjectLLM } from "./openai-client";

interface CategorySummary {
  category: string;
  totalMinutes: number;
  tasks: string[];
}

/**
 * Generate professional item descriptions for each category group.
 * Falls back to simple labels if LLM fails.
 */
export async function generateInvoiceItemDescriptions(
  projectName: string,
  categories: CategorySummary[],
  locale: string,
): Promise<Record<string, string>> {
  const model = process.env.LLM_MODEL_GENERATE ?? "gpt-5-mini";

  const categoryLines = categories
    .map(
      (c) =>
        `- ${c.category}: ${Math.round(c.totalMinutes / 60 * 10) / 10}h, tasks: ${c.tasks.slice(0, 5).join(", ")}`,
    )
    .join("\n");

  const systemPrompt =
    locale === "ko"
      ? `당신은 프리랜서 청구서 작성 전문가입니다. 프로젝트의 카테고리별 작업을 전문적인 1줄 설명으로 변환하세요. 각 카테고리에 대해 깔끔하고 전문적인 한국어 설명을 작성하세요. JSON으로 응답하세요.`
      : `You are an expert at writing professional invoice line items. Convert each category into a clean, professional one-line description. Respond in JSON.`;

  const userPrompt = `Project: ${projectName}\n\nCategories:\n${categoryLines}\n\nRespond with a JSON object where keys are category names and values are professional descriptions. Example: {"design": "UX/UI Design & Prototyping"}`;

  try {
    const result = await callJsonObjectLLM<Record<string, string>>(model, systemPrompt, userPrompt, 300);
    return result ?? {};
  } catch {
    return {};
  }
}
