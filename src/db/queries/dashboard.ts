import { eq, and, isNull, inArray, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { projects, timeEntries, costEntries, alerts } from "@/db/schema";

interface ProjectSummary {
  id: string;
  name: string;
  currency: string;
  isActive: boolean;
  progressPercent: number;
  expectedFee: number;
  expectedHours: number;
  platformFeeRate: number;
  taxRate: number;
  totalMinutes: number;
  fixedCosts: number;
}

interface RecentEntry {
  id: string;
  projectId: string;
  projectName: string;
  date: string;
  minutes: number;
  category: string;
  taskDescription: string;
}

interface ActiveAlert {
  id: string;
  projectId: string;
  projectName: string;
  alertType: string;
  metadata: Record<string, unknown>;
}

export interface DashboardData {
  projects: ProjectSummary[];
  recentEntries: RecentEntry[];
  activeAlerts: ActiveAlert[];
  weeklyMinutes: { date: string; minutes: number }[];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  // 1. Get all active projects for this user
  const projectRows = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        eq(projects.status, "active"),
        isNull(projects.deletedAt),
      ),
    );

  const projectIds = projectRows.map((p) => p.id);

  if (projectIds.length === 0) {
    return {
      projects: [],
      recentEntries: [],
      activeAlerts: [],
      weeklyMinutes: [],
    };
  }

  // 2. Get aggregated time & cost per project + recent entries + alerts + weekly summary
  const [timeAgg, costAgg, recentRows, alertRows, weeklyRows] =
    await Promise.all([
      // Time aggregation per project
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

      // Cost aggregation per project (fixed costs only, excluding platform_fee/tax)
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

      // Recent 5 time entries across all projects
      db
        .select({
          id: timeEntries.id,
          projectId: timeEntries.projectId,
          projectName: projects.name,
          date: timeEntries.date,
          minutes: timeEntries.minutes,
          category: timeEntries.category,
          taskDescription: timeEntries.taskDescription,
        })
        .from(timeEntries)
        .innerJoin(projects, eq(timeEntries.projectId, projects.id))
        .where(
          and(
            eq(projects.userId, userId),
            isNull(timeEntries.deletedAt),
            isNull(projects.deletedAt),
          ),
        )
        .orderBy(desc(timeEntries.createdAt))
        .limit(5),

      // Active (undismissed) alerts
      db
        .select({
          id: alerts.id,
          projectId: alerts.projectId,
          projectName: projects.name,
          alertType: alerts.alertType,
          metadata: alerts.metadata,
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

      // Weekly summary (last 7 days)
      db
        .select({
          date: timeEntries.date,
          minutes:
            sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)`.as(
              "minutes",
            ),
        })
        .from(timeEntries)
        .innerJoin(projects, eq(timeEntries.projectId, projects.id))
        .where(
          and(
            eq(projects.userId, userId),
            eq(timeEntries.intent, "done"),
            isNull(timeEntries.deletedAt),
            isNull(projects.deletedAt),
            sql`${timeEntries.date} >= CURRENT_DATE - INTERVAL '6 days'`,
          ),
        )
        .groupBy(timeEntries.date)
        .orderBy(timeEntries.date),
    ]);

  // Build lookup maps
  const timeMap = new Map(
    timeAgg.map((r) => [r.projectId, Number(r.totalMinutes)]),
  );
  const costMap = new Map(
    costAgg.map((r) => [r.projectId, Number(r.totalCost)]),
  );

  const projectSummaries: ProjectSummary[] = projectRows.map((p) => ({
    id: p.id,
    name: p.name,
    currency: p.currency,
    isActive: p.status === "active",
    progressPercent: p.progressPercent,
    expectedFee: Number(p.expectedFee),
    expectedHours: Number(p.expectedHours),
    platformFeeRate: Number(p.platformFeeRate),
    taxRate: Number(p.taxRate),
    totalMinutes: timeMap.get(p.id) ?? 0,
    fixedCosts: costMap.get(p.id) ?? 0,
  }));

  return {
    projects: projectSummaries,
    recentEntries: recentRows.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      projectName: r.projectName,
      date: r.date,
      minutes: r.minutes,
      category: r.category,
      taskDescription: r.taskDescription,
    })),
    activeAlerts: alertRows.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      projectName: r.projectName,
      alertType: r.alertType,
      metadata: r.metadata as Record<string, unknown>,
    })),
    weeklyMinutes: weeklyRows.map((r) => ({
      date: r.date,
      minutes: Number(r.minutes),
    })),
  };
}
