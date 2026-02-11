import { generateMessages, type GeneratedMessage } from "./generate-messages";
import type { MessageContext } from "./message-prompt";
import { createAiAction } from "@/db/queries/ai-actions";

interface ScopeBillingContext {
  userId: string;
  projectId: string;
  projectName: string;
  clientName: string;
  expectedFee: number;
  expectedHours: number;
  totalHours: number;
  progressPercent: number;
  currency: string;
  nominalHourly: number | null;
  realHourly: number | null;
  actualRevisionCount: number;
  triggeredRules: string[];
  metadata: Record<string, unknown>;
}

/**
 * Generate 3-tone billing messages and save as ai_action (billing_suggestion).
 * Called asynchronously after scope creep detection — does not block the request.
 */
export async function generateBillingAction(ctx: ScopeBillingContext): Promise<void> {
  try {
    const messageCtx: MessageContext = {
      clientName: ctx.clientName,
      projectName: ctx.projectName,
      expectedFee: ctx.expectedFee,
      expectedHours: ctx.expectedHours,
      totalHours: ctx.totalHours,
      progressPercent: ctx.progressPercent,
      triggeredRules: ctx.triggeredRules,
      metadata: ctx.metadata,
      currency: ctx.currency,
    };

    const messages = await generateMessages(messageCtx, "ko");

    const overHours = Math.round((ctx.totalHours - ctx.expectedHours) * 10) / 10;
    const title = `${ctx.projectName} — 스코프 크리프 감지, 청구 메시지 준비됨`;

    await createAiAction(ctx.userId, {
      type: "billing_suggestion",
      title,
      message: `수정 ${ctx.actualRevisionCount}회, 추가 ${overHours > 0 ? overHours : 0}시간 초과. 3가지 톤의 메시지가 준비됐어요.`,
      projectId: ctx.projectId,
      payload: {
        messages: messages.map((m) => ({
          tone: m.tone,
          subject: m.subject,
          body: m.body,
        })),
        metrics: {
          expectedHours: ctx.expectedHours,
          totalHours: ctx.totalHours,
          overHours: overHours > 0 ? overHours : 0,
          progressPercent: ctx.progressPercent,
          nominalHourly: ctx.nominalHourly,
          realHourly: ctx.realHourly,
          actualRevisionCount: ctx.actualRevisionCount,
          currency: ctx.currency,
        },
        triggeredRules: ctx.triggeredRules,
        clientName: ctx.clientName,
        projectName: ctx.projectName,
      },
    });
  } catch (error) {
    console.error("[generateBillingAction] Failed:", error);
  }
}
