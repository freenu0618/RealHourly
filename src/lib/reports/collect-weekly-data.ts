import { eq, and, isNull, inArray, sql, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  projects,
  timeEntries,
  costEntries,
  alerts,
  clients,
} from "@/db/schema";
import { formatDate } from "@/lib/date";
import { addDays } from "date-fns";

export interface WeeklyReportData {
  period: { start: string; end: string };

  // Time summary
  totalMinutes: number;
  entryCount: number;
  dailyBreakdown: { date: string; minutes: number }[];

  // By project
  byProject: {
    name: string;
    minutes: number;
    categories: { category: string; minutes: number }[];
    realHourly: number | null;
  }[];

  // By category
  byCategory: { category: string; minutes: number; percent: number }[];

  // Comparison (prev week)
  prevWeekMinutes: number;
  minutesDelta: number;
  minutesDeltaPercent: number;

  // Scope alerts
  scopeAlerts: { projectName: string; alertType: string }[];

  // Highlights
  busiestDay: { date: string; minutes: number };
  topProject: { name: string; minutes: number };
  revisionPercent: number;
}

export async function collectWeeklyData(
  userId: string,
  weekStart: Date,
): Promise<WeeklyReportData> {
  const weekStartStr = formatDate(weekStart, "yyyy-MM-dd");
  const weekEnd = addDays(weekStart, 6);
  const weekEndStr = formatDate(weekEnd, "yyyy-MM-dd");

  // Previous week
  const prevWeekStart = addDays(weekStart, -7);
  const prevWeekStartStr = formatDate(prevWeekStart, "yyyy-MM-dd");
  const prevWeekEndStr = formatDate(addDays(prevWeekStart, 6), "yyyy-MM-dd");

  // Get user projects
  const projectRows = await db
    .select({
      id: projects.id,
      name: projects.name,
      clientId: projects.clientId,
      expectedFee: projects.expectedFee,
      expectedHours: projects.expectedHours,
      platformFeeRate: projects.platformFeeRate,
      taxRate: projects.taxRate,
    })
    .from(projects)
    .where(
      and(eq(projects.userId, userId), isNull(projects.deletedAt)),
    );

  const projectIds = projectRows.map((p) => p.id);
  const projectMap = new Map(projectRows.map((p) => [p.id, p]));

  if (projectIds.length === 0) {
    return emptyReport(weekStartStr, weekEndStr);
  }

  // Parallel queries
  const [
    weekEntries,
    prevWeekAgg,
    weekCategoryAgg,
    weekProjectAgg,
    projectTotalTimeAgg,
    projectCostAgg,
    alertRows,
  ] = await Promise.all([
    // This week's entries (for daily breakdown + count)
    db
      .select({
        id: timeEntries.id,
        projectId: timeEntries.projectId,
        date: timeEntries.date,
        minutes: timeEntries.minutes,
        category: timeEntries.category,
      })
      .from(timeEntries)
      .where(
        and(
          inArray(timeEntries.projectId, projectIds),
          eq(timeEntries.intent, "done"),
          isNull(timeEntries.deletedAt),
          gte(timeEntries.date, weekStartStr),
          lte(timeEntries.date, weekEndStr),
        ),
      ),

    // Prev week total
    db
      .select({
        total:
          sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)`.as("total"),
      })
      .from(timeEntries)
      .innerJoin(projects, eq(timeEntries.projectId, projects.id))
      .where(
        and(
          eq(projects.userId, userId),
          eq(timeEntries.intent, "done"),
          isNull(timeEntries.deletedAt),
          isNull(projects.deletedAt),
          gte(timeEntries.date, prevWeekStartStr),
          lte(timeEntries.date, prevWeekEndStr),
        ),
      ),

    // Category breakdown this week
    db
      .select({
        category: timeEntries.category,
        minutes:
          sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)`.as("minutes"),
      })
      .from(timeEntries)
      .where(
        and(
          inArray(timeEntries.projectId, projectIds),
          eq(timeEntries.intent, "done"),
          isNull(timeEntries.deletedAt),
          gte(timeEntries.date, weekStartStr),
          lte(timeEntries.date, weekEndStr),
        ),
      )
      .groupBy(timeEntries.category),

    // Project breakdown this week
    db
      .select({
        projectId: timeEntries.projectId,
        minutes:
          sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)`.as("minutes"),
      })
      .from(timeEntries)
      .where(
        and(
          inArray(timeEntries.projectId, projectIds),
          eq(timeEntries.intent, "done"),
          isNull(timeEntries.deletedAt),
          gte(timeEntries.date, weekStartStr),
          lte(timeEntries.date, weekEndStr),
        ),
      )
      .groupBy(timeEntries.projectId),

    // Total time per project (all-time, for realHourly)
    db
      .select({
        projectId: timeEntries.projectId,
        totalMinutes:
          sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)`.as(
            "total_minutes",
          ),
      })
      .from(timeEntries)
      .where(
        and(
          inArray(timeEntries.projectId, projectIds),
          eq(timeEntries.intent, "done"),
          isNull(timeEntries.deletedAt),
        ),
      )
      .groupBy(timeEntries.projectId),

    // Fixed costs per project
    db
      .select({
        projectId: costEntries.projectId,
        totalCost:
          sql<number>`COALESCE(SUM(${costEntries.amount}::numeric), 0)`.as(
            "total_cost",
          ),
      })
      .from(costEntries)
      .where(
        and(
          inArray(costEntries.projectId, projectIds),
          sql`${costEntries.costType} NOT IN ('platform_fee', 'tax')`,
          isNull(costEntries.deletedAt),
        ),
      )
      .groupBy(costEntries.projectId),

    // Active alerts
    db
      .select({
        projectId: alerts.projectId,
        alertType: alerts.alertType,
      })
      .from(alerts)
      .innerJoin(projects, eq(alerts.projectId, projects.id))
      .where(
        and(
          eq(projects.userId, userId),
          isNull(alerts.dismissedAt),
          isNull(alerts.deletedAt),
          isNull(projects.deletedAt),
        ),
      ),
  ]);

  // Build metrics
  const totalMinutes = weekEntries.reduce((s, e) => s + e.minutes, 0);
  const entryCount = weekEntries.length;

  // Daily breakdown (Mon-Sun)
  const dailyMap = new Map<string, number>();
  for (let i = 0; i <= 6; i++) {
    dailyMap.set(formatDate(addDays(weekStart, i), "yyyy-MM-dd"), 0);
  }
  for (const e of weekEntries) {
    dailyMap.set(e.date, (dailyMap.get(e.date) ?? 0) + e.minutes);
  }
  const dailyBreakdown = [...dailyMap.entries()].map(([date, minutes]) => ({
    date,
    minutes,
  }));

  // Category breakdown with percents
  const byCategory = weekCategoryAgg.map((c) => ({
    category: c.category,
    minutes: Number(c.minutes),
    percent:
      totalMinutes > 0
        ? Math.round((Number(c.minutes) / totalMinutes) * 100)
        : 0,
  }));

  // Project breakdown with realHourly
  const totalTimeMap = new Map(
    projectTotalTimeAgg.map((r) => [r.projectId, Number(r.totalMinutes)]),
  );
  const costMap = new Map(
    projectCostAgg.map((r) => [r.projectId, Number(r.totalCost)]),
  );

  // Category per project this week
  const projectCatMap = new Map<
    string,
    { category: string; minutes: number }[]
  >();
  for (const e of weekEntries) {
    const arr = projectCatMap.get(e.projectId) ?? [];
    const existing = arr.find((c) => c.category === e.category);
    if (existing) {
      existing.minutes += e.minutes;
    } else {
      arr.push({ category: e.category, minutes: e.minutes });
    }
    projectCatMap.set(e.projectId, arr);
  }

  const byProject = weekProjectAgg
    .map((r) => {
      const proj = projectMap.get(r.projectId);
      if (!proj) return null;

      const allTimeMinutes = totalTimeMap.get(r.projectId) ?? 0;
      const allTimeHours = allTimeMinutes / 60;
      const gross = Number(proj.expectedFee);
      const platformFee = gross * Number(proj.platformFeeRate);
      const tax = gross * Number(proj.taxRate);
      const fixedCosts = costMap.get(r.projectId) ?? 0;
      const net = gross - (platformFee + tax + fixedCosts);
      const realHourly =
        allTimeHours > 0 ? Math.round((net / allTimeHours) * 100) / 100 : null;

      return {
        name: proj.name,
        minutes: Number(r.minutes),
        categories: projectCatMap.get(r.projectId) ?? [],
        realHourly,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.minutes - a.minutes);

  // Comparison
  const prevWeekMinutes = Number(prevWeekAgg[0]?.total ?? 0);
  const minutesDelta = totalMinutes - prevWeekMinutes;
  const minutesDeltaPercent =
    prevWeekMinutes > 0
      ? Math.round((minutesDelta / prevWeekMinutes) * 100)
      : 0;

  // Scope alerts
  const scopeAlerts = alertRows.map((a) => ({
    projectName: projectMap.get(a.projectId)?.name ?? "Unknown",
    alertType: a.alertType,
  }));

  // Highlights
  const busiestDay = dailyBreakdown.reduce(
    (best, d) => (d.minutes > best.minutes ? d : best),
    dailyBreakdown[0] ?? { date: weekStartStr, minutes: 0 },
  );

  const topProject =
    byProject.length > 0
      ? { name: byProject[0].name, minutes: byProject[0].minutes }
      : { name: "-", minutes: 0 };

  const revisionMinutes = byCategory
    .filter((c) => c.category === "revision")
    .reduce((s, c) => s + c.minutes, 0);
  const revisionPercent =
    totalMinutes > 0
      ? Math.round((revisionMinutes / totalMinutes) * 100)
      : 0;

  return {
    period: { start: weekStartStr, end: weekEndStr },
    totalMinutes,
    entryCount,
    dailyBreakdown,
    byProject,
    byCategory,
    prevWeekMinutes,
    minutesDelta,
    minutesDeltaPercent,
    scopeAlerts,
    busiestDay,
    topProject,
    revisionPercent,
  };
}

function emptyReport(start: string, end: string): WeeklyReportData {
  return {
    period: { start, end },
    totalMinutes: 0,
    entryCount: 0,
    dailyBreakdown: [],
    byProject: [],
    byCategory: [],
    prevWeekMinutes: 0,
    minutesDelta: 0,
    minutesDeltaPercent: 0,
    scopeAlerts: [],
    busiestDay: { date: start, minutes: 0 },
    topProject: { name: "-", minutes: 0 },
    revisionPercent: 0,
  };
}
