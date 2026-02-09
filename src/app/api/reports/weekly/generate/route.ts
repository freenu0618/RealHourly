import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { GenerateWeeklyReportSchema } from "@/lib/validators/reports";
import { collectWeeklyData } from "@/lib/reports/collect-weekly-data";
import { generateWeeklyInsight } from "@/lib/ai/generate-weekly-insight";
import {
  getWeeklyReport,
  createWeeklyReport,
} from "@/db/queries/weekly-reports";
import { startOfWeek, subWeeks } from "date-fns";
import { formatDate } from "@/lib/date";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
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

    // Generate AI insight
    const aiInsight = await generateWeeklyInsight(data);

    // Save to DB
    const report = await createWeeklyReport(
      user.id,
      data.period.start,
      data.period.end,
      data,
      aiInsight,
    );

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
