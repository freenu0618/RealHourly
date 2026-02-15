import { NextResponse } from "next/server";
import { eq, and, isNull, sql, gt } from "drizzle-orm";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { db } from "@/db";
import {
  projects,
  timeEntries,
  costEntries,
  weeklyReports,
  usageCounts,
} from "@/db/schema";

export interface OnboardingProgress {
  hasProject: boolean;
  hasTimeEntry: boolean;
  hasCostOrFee: boolean;
  hasEnoughEntries: boolean;
  hasWeeklyReport: boolean;
  hasUsedAiChat: boolean;
  completedCount: number;
  totalCount: number;
}

export async function GET() {
  try {
    const user = await requireUser();
    const userId = user.id;

    const [
      projectCount,
      timeEntryCount,
      costEntryCount,
      feeProjectCount,
      weeklyReportCount,
      aiChatUsage,
    ] = await Promise.all([
      // 1. Has at least 1 project
      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)))
        .then((r) => Number(r[0].count)),

      // 2. Has at least 1 time entry
      db
        .select({ count: sql<number>`count(*)` })
        .from(timeEntries)
        .innerJoin(projects, eq(timeEntries.projectId, projects.id))
        .where(
          and(
            eq(projects.userId, userId),
            isNull(timeEntries.deletedAt),
            isNull(projects.deletedAt),
          ),
        )
        .then((r) => Number(r[0].count)),

      // 3a. Has at least 1 cost entry
      db
        .select({ count: sql<number>`count(*)` })
        .from(costEntries)
        .innerJoin(projects, eq(costEntries.projectId, projects.id))
        .where(
          and(
            eq(projects.userId, userId),
            isNull(costEntries.deletedAt),
            isNull(projects.deletedAt),
          ),
        )
        .then((r) => Number(r[0].count)),

      // 3b. Has project with platform fee > 0
      db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(
          and(
            eq(projects.userId, userId),
            isNull(projects.deletedAt),
            gt(projects.platformFeeRate, "0"),
          ),
        )
        .then((r) => Number(r[0].count)),

      // 5. Has at least 1 weekly report
      db
        .select({ count: sql<number>`count(*)` })
        .from(weeklyReports)
        .where(
          and(
            eq(weeklyReports.userId, userId),
            isNull(weeklyReports.deletedAt),
          ),
        )
        .then((r) => Number(r[0].count)),

      // 6. Has used AI chat at least once
      db
        .select({ count: sql<number>`COALESCE(SUM(count), 0)` })
        .from(usageCounts)
        .where(
          and(
            eq(usageCounts.userId, userId),
            eq(usageCounts.feature, "ai_chat"),
          ),
        )
        .then((r) => Number(r[0].count)),
    ]);

    const hasProject = projectCount > 0;
    const hasTimeEntry = timeEntryCount > 0;
    const hasCostOrFee = costEntryCount > 0 || feeProjectCount > 0;
    const hasEnoughEntries = timeEntryCount >= 3;
    const hasWeeklyReport = weeklyReportCount > 0;
    const hasUsedAiChat = aiChatUsage > 0;

    const steps = [
      hasProject,
      hasTimeEntry,
      hasCostOrFee,
      hasEnoughEntries,
      hasWeeklyReport,
      hasUsedAiChat,
    ];
    const completedCount = steps.filter(Boolean).length;

    const data: OnboardingProgress = {
      hasProject,
      hasTimeEntry,
      hasCostOrFee,
      hasEnoughEntries,
      hasWeeklyReport,
      hasUsedAiChat,
      completedCount,
      totalCount: steps.length,
    };

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
