export interface MessageContext {
  clientName: string;
  projectName: string;
  expectedFee: number;
  expectedHours: number;
  totalHours: number;
  progressPercent: number;
  triggeredRules: string[];
  metadata: Record<string, unknown>;
  currency: string;
}

/**
 * Build the system prompt for billing message generation.
 * Uses explicit messageLang if provided, otherwise auto-detects from projectName.
 */
export function buildMessagePrompt(ctx: MessageContext, messageLang?: "ko" | "en"): string {
  const lang = messageLang === "ko" ? "Korean"
    : messageLang === "en" ? "English"
    : /[가-힣]/.test(ctx.projectName) ? "Korean" : "English";

  const ruleExplanations = ctx.triggeredRules
    .map((rule) => {
      const ruleKey = rule.replace("scope_", "");
      const data = (ctx.metadata[ruleKey] ?? ctx.metadata[rule] ?? {}) as Record<string, unknown>;
      switch (rule) {
        case "scope_rule1":
          return `- Time Overrun: ${data.totalHours ?? "?"}h used out of ${data.expectedHours ?? "?"}h expected (${Math.round(((data.timeRatio as number) ?? 0) * 100)}%), but project progress is only ${data.progressPercent ?? "?"}%`;
        case "scope_rule2":
          return `- Excessive Revisions: Revision work accounts for ${Math.round(((data.revisionRatio as number) ?? 0) * 100)}% of total time (${data.revisionMinutes ?? "?"}min / ${data.totalMinutes ?? "?"}min)`;
        case "scope_rule3":
          return `- Frequent Revisions: ${data.revisionCount ?? "?"} separate revision entries recorded (threshold: ${data.threshold ?? 5})`;
        case "scope_rule4":
          return `- Revision Count Exceeded: ${data.actualRevisionCount ?? "?"} revisions done, but only ${data.agreedRevisionCount ?? "?"} were agreed upon (${data.excessCount ?? "?"} extra revisions)`;
        default:
          return `- ${rule}`;
      }
    })
    .join("\n");

  return `You are a professional billing consultant for freelancers. Generate exactly 3 billing/negotiation messages for a freelancer to send to their client about scope creep.

## Context
- Client: ${ctx.clientName || "Client"}
- Project: ${ctx.projectName}
- Currency: ${ctx.currency}
- Expected Fee: ${ctx.expectedFee} ${ctx.currency}
- Expected Hours: ${ctx.expectedHours}h
- Actual Hours Worked: ${ctx.totalHours}h
- Progress: ${ctx.progressPercent}%

## Detected Issues
${ruleExplanations}

## Requirements

1. Generate 3 messages with tones: "polite", "neutral", "firm" (in that order)
2. Each message must have a concise subject line and a professional body
3. Include specific numbers from the context (hours, fees, percentages)
4. Suggest 1-3 of these options where appropriate:
   - Additional fee (추가 비용)
   - Timeline extension (일정 연장)
   - Scope reduction (범위 조정)
5. Output in ${lang}
6. Keep body under 300 words each
7. Be empathetic in polite, balanced in neutral, assertive in firm
8. Do NOT use placeholder brackets like [name] — use the actual values provided
${lang === "Korean" ? `
## Tone Guide (Korean)
- polite: 공손하고 조심스러운 톤. "혹시 괜찮으시다면...", "말씀드리기 조심스럽지만..."
- neutral: 사실 중심, 전문적. "현재 상황을 공유드립니다.", "다음 단계를 논의하면 좋겠습니다."
- firm: 명확하고 단호한. "추가 작업에 대한 비용 조정이 필요합니다.", "현재 범위를 재조정해야 합니다."` : `
## Tone Guide (English)
- polite: Gentle and considerate. "I wanted to kindly bring to your attention...", "If it's alright with you..."
- neutral: Fact-based, professional. "I'd like to share a project status update.", "Let's discuss next steps."
- firm: Clear and direct. "We need to adjust the fee for additional work.", "The current scope needs to be revised."`}`;
}
