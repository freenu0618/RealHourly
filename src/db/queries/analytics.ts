import { eq, and, isNull, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { projects, timeEntries, costEntries, clients } from "@/db/schema";

export interface ProjectComparison {
  id: string;
  name: string;
  clientName: string | null;
  currency: string;
  gross: number;
  net: number;
  totalHours: number;
  nominalHourly: number | null;
  realHourly: number | null;
  progressPercent: number;
  revisionPercent: number;
  categoryBreakdown: { category: string; minutes: number }[];
}

export interface ComparisonInsight {
  type: "best_rate" | "worst_rate" | "most_hours" | "highest_revision";
  projectName: string;
  value: number;
}

export interface ClientSummary {
  clientName: string;
  projectCount: number;
  totalHours: number;
  avgRealHourly: number | null;
  totalNet: number;
}

export interface ComparisonData {
  projects: ProjectComparison[];
  insights: ComparisonInsight[];
  byClient: ClientSummary[];
  avgRealHourly: number | null;
  totalRevenue: number;
  totalHours: number;
}

export async function getComparisonData(
  userId: string,
): Promise<ComparisonData> {
  // 1. Get all active projects with client info
  const projectRows = await db
    .select({
      id: projects.id,
      name: projects.name,
      clientId: projects.clientId,
      currency: projects.currency,
      expectedFee: projects.expectedFee,
      expectedHours: projects.expectedHours,
      platformFeeRate: projects.platformFeeRate,
      taxRate: projects.taxRate,
      progressPercent: projects.progressPercent,
    })
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
      insights: [],
      byClient: [],
      avgRealHourly: null,
      totalRevenue: 0,
      totalHours: 0,
    };
  }

  // 2. Parallel queries: time, cost, category breakdown, clients
  const clientIds = [
    ...new Set(projectRows.map((p) => p.clientId).filter(Boolean)),
  ] as string[];

  const [timeAgg, costAgg, categoryAgg, clientRows] = await Promise.all([
    // Total minutes per project (done only)
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

    // Category breakdown per project
    db
      .select({
        projectId: timeEntries.projectId,
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
        ),
      )
      .groupBy(timeEntries.projectId, timeEntries.category),

    // Client names
    clientIds.length > 0
      ? db
          .select({ id: clients.id, name: clients.name })
          .from(clients)
          .where(
            and(inArray(clients.id, clientIds), isNull(clients.deletedAt)),
          )
      : Promise.resolve([]),
  ]);

  // Build lookup maps
  const timeMap = new Map(
    timeAgg.map((r) => [r.projectId, Number(r.totalMinutes)]),
  );
  const costMap = new Map(
    costAgg.map((r) => [r.projectId, Number(r.totalCost)]),
  );
  const clientMap = new Map(clientRows.map((c) => [c.id, c.name]));

  // Category breakdown per project
  const categoryMap = new Map<
    string,
    { category: string; minutes: number }[]
  >();
  for (const row of categoryAgg) {
    const arr = categoryMap.get(row.projectId) ?? [];
    arr.push({ category: row.category, minutes: Number(row.minutes) });
    categoryMap.set(row.projectId, arr);
  }

  // 3. Calculate metrics per project
  const projectComparisons: ProjectComparison[] = projectRows.map((p) => {
    const gross = Number(p.expectedFee);
    const platformFeeAmount = gross * Number(p.platformFeeRate);
    const taxAmount = gross * Number(p.taxRate);
    const fixedCosts = costMap.get(p.id) ?? 0;
    const directCost = fixedCosts + platformFeeAmount + taxAmount;
    const net = gross - directCost;

    const totalMinutes = timeMap.get(p.id) ?? 0;
    const totalHours = totalMinutes / 60;
    const expectedHours = Number(p.expectedHours);

    const nominalHourly = expectedHours > 0 ? gross / expectedHours : null;
    const realHourly = totalHours > 0 ? net / totalHours : null;

    const categories = categoryMap.get(p.id) ?? [];
    const revisionMinutes = categories
      .filter((c) => c.category === "revision")
      .reduce((sum, c) => sum + c.minutes, 0);
    const revisionPercent =
      totalMinutes > 0
        ? Math.round((revisionMinutes / totalMinutes) * 100)
        : 0;

    return {
      id: p.id,
      name: p.name,
      clientName: p.clientId ? (clientMap.get(p.clientId) ?? null) : null,
      currency: p.currency,
      gross,
      net,
      totalHours: Math.round(totalHours * 10) / 10,
      nominalHourly:
        nominalHourly !== null
          ? Math.round(nominalHourly * 100) / 100
          : null,
      realHourly:
        realHourly !== null ? Math.round(realHourly * 100) / 100 : null,
      progressPercent: p.progressPercent,
      revisionPercent,
      categoryBreakdown: categories,
    };
  });

  // 4. Generate insights
  const insights: ComparisonInsight[] = [];
  const withRate = projectComparisons.filter((p) => p.realHourly !== null);

  if (withRate.length > 0) {
    const best = withRate.reduce((a, b) =>
      a.realHourly! > b.realHourly! ? a : b,
    );
    insights.push({
      type: "best_rate",
      projectName: best.name,
      value: best.realHourly!,
    });

    const worst = withRate.reduce((a, b) =>
      a.realHourly! < b.realHourly! ? a : b,
    );
    if (worst.id !== best.id) {
      insights.push({
        type: "worst_rate",
        projectName: worst.name,
        value: worst.realHourly!,
      });
    }
  }

  const withHours = projectComparisons.filter((p) => p.totalHours > 0);
  if (withHours.length > 0) {
    const mostHours = withHours.reduce((a, b) =>
      a.totalHours > b.totalHours ? a : b,
    );
    insights.push({
      type: "most_hours",
      projectName: mostHours.name,
      value: mostHours.totalHours,
    });
  }

  const withRevision = projectComparisons.filter(
    (p) => p.revisionPercent > 0,
  );
  if (withRevision.length > 0) {
    const highRevision = withRevision.reduce((a, b) =>
      a.revisionPercent > b.revisionPercent ? a : b,
    );
    if (highRevision.revisionPercent >= 20) {
      insights.push({
        type: "highest_revision",
        projectName: highRevision.name,
        value: highRevision.revisionPercent,
      });
    }
  }

  // 5. Group by client
  const clientGroups = new Map<
    string,
    { projects: ProjectComparison[]; totalNet: number; totalHours: number }
  >();
  for (const p of projectComparisons) {
    const key = p.clientName ?? "Independent";
    const group = clientGroups.get(key) ?? {
      projects: [],
      totalNet: 0,
      totalHours: 0,
    };
    group.projects.push(p);
    group.totalNet += p.net;
    group.totalHours += p.totalHours;
    clientGroups.set(key, group);
  }

  const byClient: ClientSummary[] = [...clientGroups.entries()].map(
    ([clientName, group]) => {
      const rates = group.projects
        .map((p) => p.realHourly)
        .filter((r): r is number => r !== null);
      return {
        clientName,
        projectCount: group.projects.length,
        totalHours: Math.round(group.totalHours * 10) / 10,
        avgRealHourly:
          rates.length > 0
            ? Math.round(
                (rates.reduce((a, b) => a + b, 0) / rates.length) * 100,
              ) / 100
            : null,
        totalNet: Math.round(group.totalNet * 100) / 100,
      };
    },
  );

  // 6. Aggregate totals
  const allRates = projectComparisons
    .map((p) => p.realHourly)
    .filter((r): r is number => r !== null);
  const avgRealHourly =
    allRates.length > 0
      ? Math.round(
          (allRates.reduce((a, b) => a + b, 0) / allRates.length) * 100,
        ) / 100
      : null;

  const totalRevenue = Math.round(
    projectComparisons.reduce((sum, p) => sum + p.net, 0) * 100,
  ) / 100;
  const totalHours = Math.round(
    projectComparisons.reduce((sum, p) => sum + p.totalHours, 0) * 10,
  ) / 10;

  return {
    projects: projectComparisons,
    insights,
    byClient,
    avgRealHourly,
    totalRevenue,
    totalHours,
  };
}
