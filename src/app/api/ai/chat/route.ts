import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ChatMessageSchema } from "@/lib/validators/chat";
import { generateChatResponse } from "@/lib/ai/generate-chat-response";
import { sanitizeForMessage } from "@/lib/ai/sanitize-input";
import { chatRateLimit } from "@/lib/api/rate-limit";
import { checkQuota, trackUsage } from "@/lib/polar/feature-gate";

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    // Monthly quota check
    await checkQuota(user.id, "ai_chat");

    const { success, retryAfterMs } = await chatRateLimit.check(user.id);
    if (!success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" } },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        },
      );
    }

    const body = ChatMessageSchema.parse(await req.json());
    const sanitizedMessage = sanitizeForMessage(body.message);

    const reply = await generateChatResponse(
      user.id,
      sanitizedMessage,
      body.conversationHistory,
    );

    // Track usage after successful response
    await trackUsage(user.id, "ai_chat");

    return NextResponse.json({ data: { reply } });
  } catch (error) {
    return handleApiError(error);
  }
}
