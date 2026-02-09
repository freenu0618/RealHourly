import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "@/db";
import { weeklyReports } from "@/db/schema";
import type { WeeklyReportData } from "@/lib/reports/collect-weekly-data";

export async function getWeeklyReport(userId: string, weekStart: string) {
  const rows = await db
    .select()
    .from(weeklyReports)
    .where(
      and(
        eq(weeklyReports.userId, userId),
        eq(weeklyReports.weekStart, weekStart),
        isNull(weeklyReports.deletedAt),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function getWeeklyReports(userId: string, limit: number = 12) {
  return db
    .select()
    .from(weeklyReports)
    .where(
      and(
        eq(weeklyReports.userId, userId),
        isNull(weeklyReports.deletedAt),
      ),
    )
    .orderBy(desc(weeklyReports.weekStart))
    .limit(limit);
}

export async function createWeeklyReport(
  userId: string,
  weekStart: string,
  weekEnd: string,
  data: WeeklyReportData,
  aiInsight: string | null,
) {
  const rows = await db
    .insert(weeklyReports)
    .values({
      userId,
      weekStart,
      weekEnd,
      data,
      aiInsight,
    })
    .returning();

  return rows[0];
}
