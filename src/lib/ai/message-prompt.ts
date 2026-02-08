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
 * Auto-detects language based on projectName characters.
 */
export function buildMessagePrompt(ctx: MessageContext): string {
  const hasKorean = /[가-힣]/.test(ctx.projectName);
  const lang = hasKorean ? "Korean" : "English";

  const ruleExplanations = ctx.triggeredRules
    .map((rule) => {
      const data = (ctx.metadata[rule] ?? {}) as Record<string, unknown>;
      switch (rule) {
        case "scope_rule1":
          return `- Time Overrun: ${data.totalHours ?? "?"}h used out of ${data.expectedHours ?? "?"}h expected (${Math.round(((data.timeRatio as number) ?? 0) * 100)}%), but project progress is only ${data.progressPercent ?? "?"}%`;
        case "scope_rule2":
          return `- Excessive Revisions: Revision work accounts for ${Math.round(((data.revisionRatio as number) ?? 0) * 100)}% of total time (${data.revisionMinutes ?? "?"}min / ${data.totalMinutes ?? "?"}min)`;
        case "scope_rule3":
          return `- Frequent Revisions: ${data.revisionCount ?? "?"} separate revision entries recorded (threshold: ${data.threshold ?? 5})`;
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
5. Output in ${lang} — match the language of the project name
6. Keep body under 300 words each
7. Be empathetic in polite, balanced in neutral, assertive in firm
8. Do NOT use placeholder brackets like [name] — use the actual values provided`;
}
