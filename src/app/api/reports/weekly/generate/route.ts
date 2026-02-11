import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { GenerateWeeklyReportSchema } from "@/lib/validators/reports";
import { collectWeeklyData } from "@/lib/reports/collect-weekly-data";
import { generateWeeklyInsight, parseWeeklyInsight } from "@/lib/ai/generate-weekly-insight";
import {
  getWeeklyReport,
  createWeeklyReport,
} from "@/db/queries/weekly-reports";
import { createAiAction } from "@/db/queries/ai-actions";
import { startOfWeek, subWeeks } from "date-fns";
import { formatDate } from "@/lib/date";
import { reportRateLimit } from "@/lib/api/rate-limit";

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const { success, retryAfterMs } = await reportRateLimit.check(user.id);
    if (!success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests" } },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
      );
    }
    const body = GenerateWeeklyReportSchema.parse(await req.json());

    // Default to last week's Monday
    const weekStartDate = body.weekStart
      ? startOfWeek(new Date(body.weekStart), { weekStartsOn: 1 })
      : startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });

    const weekStartStr = formatDate(weekStartDate, "yyyy-MM-dd");

    // Check if already exists
    const existing = await getWeeklyReport(user.id, weekStartStr);
    if (existing) {
      return NextResponse.json({ data: existing });
    }

    // Collect data
    const data = await collectWeeklyData(user.id, weekStartDate);

    // Generate AI insight (structured JSON string)
    const aiInsight = await generateWeeklyInsight(data);

    // Save to DB
    const report = await createWeeklyReport(
      user.id,
      data.period.start,
      data.period.end,
      data,
      aiInsight,
    );

    // Save recommended actions to ai_actions (non-blocking)
    try {
      const insight = parseWeeklyInsight(aiInsight);
      if (insight && insight.actions.length > 0) {
        await Promise.all(
          insight.actions.map((action) =>
            createAiAction(user.id, {
              projectId: null,
              type: "weekly_report",
              title: action.text,
              message: `주간 리포트 (${data.period.start} ~ ${data.period.end})에서 제안된 액션`,
              payload: {
                weekStart: data.period.start,
                projectName: action.projectName,
              },
            }),
          ),
        );
      }
    } catch {
      console.error("[WeeklyReport] Failed to save ai_actions");
    }

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
