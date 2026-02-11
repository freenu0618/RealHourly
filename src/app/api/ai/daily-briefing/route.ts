import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { getTodayBriefing, createAiAction, deleteTodayBriefings } from "@/db/queries/ai-actions";
import { generateDailyBriefing } from "@/lib/ai/generate-daily-briefing";
import { rateLimit } from "@/lib/api/rate-limit";

const briefingRateLimit = rateLimit({ limit: 3, windowMs: 60_000 });

export async function GET() {
  try {
    const user = await requireUser();

    // 1. Check for cached briefing today (skip dismissed ones)
    const existing = await getTodayBriefing(user.id);
    if (existing && existing.status !== "dismissed") {
      return NextResponse.json({ data: existing, cached: true });
    }

    // 2. Rate limit check
    const rl = await briefingRateLimit.check(user.id);
    if (!rl.success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests" } },
        { status: 429 },
      );
    }

    // 3. Generate new briefing
    const { title, message } = await generateDailyBriefing(user.id);

    // 4. Save to ai_actions (re-check to prevent race condition)
    const recheck = await getTodayBriefing(user.id);
    if (recheck && recheck.status !== "dismissed") {
      return NextResponse.json({ data: recheck, cached: true });
    }

    const action = await createAiAction(user.id, {
      type: "briefing",
      title,
      message,
      projectId: null,
      payload: null,
    });

    return NextResponse.json({ data: action, cached: false });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    const deleted = await deleteTodayBriefings(user.id);
    return NextResponse.json({ data: { deleted } });
  } catch (error) {
    return handleApiError(error);
  }
}
