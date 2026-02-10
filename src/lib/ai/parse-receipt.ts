import OpenAI from "openai";
import type { ParsedReceipt } from "@/lib/validators/receipt";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

const SYSTEM_PROMPT = `You are a receipt/invoice data extractor for a freelancer expense tracking app.
Extract the following from the uploaded image:
- amount: The total amount (number only, no currency symbol)
- currency: ISO currency code (KRW, USD, EUR, GBP, JPY)
- date: Transaction date in YYYY-MM-DD format, or null if not visible
- costType: One of "platform_fee", "tax", "tool", "contractor", "misc"
- notes: Brief description of the expense (e.g., "Adobe Creative Cloud monthly subscription")
- confidence: Your confidence level 0-1 in the extraction accuracy
- rawText: All visible text from the image (for verification)

Rules:
- If the image shows a platform settlement (크몽, Upwork, Fiverr), extract the fee/commission amount, not the total.
- For Korean receipts, the amount after 합계/총액/결제금액 is the target amount.
- If currency is ambiguous, default to the user's currency.
- If costType is unclear, use "misc".`;

const receiptJsonSchema = {
  name: "receipt_parse",
  strict: true,
  schema: {
    type: "object" as const,
    properties: {
      amount: { type: "number" as const, description: "Total amount (number only)" },
      currency: { type: "string" as const, enum: ["KRW", "USD", "EUR", "GBP", "JPY"] },
      date: { type: ["string", "null"] as const, description: "YYYY-MM-DD or null" },
      costType: { type: "string" as const, enum: ["platform_fee", "tax", "tool", "contractor", "misc"] },
      notes: { type: "string" as const, description: "Brief expense description" },
      confidence: { type: "number" as const, description: "0-1 confidence level" },
      rawText: { type: "string" as const, description: "All visible text from image" },
    },
    required: ["amount", "currency", "date", "costType", "notes", "confidence", "rawText"],
    additionalProperties: false,
  },
};

export async function parseReceipt(
  imageBase64: string,
  userCurrency: string,
): Promise<ParsedReceipt> {
  const model = process.env.LLM_MODEL_PARSE || "gpt-4o-mini";

  const completion = await getOpenAI().chat.completions.create({
    model,
    max_completion_tokens: 1000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "low" },
          },
          {
            type: "text",
            text: `User currency: ${userCurrency}. Extract expense data from this receipt/invoice.`,
          },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: receiptJsonSchema,
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("LLM returned empty response");
  }

  return JSON.parse(content) as ParsedReceipt;
}
