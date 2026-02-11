import { NextResponse } from "next/server";
import { eq, and, isNull, sql, inArray, notInArray } from "drizzle-orm";
import { requireUser } from "@/lib/auth/server";
import { handleApiError } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { db } from "@/db";
import { clients, projects, timeEntries, costEntries } from "@/db/schema";

type Ctx = { params: Promise<{ clientId: string }> };

interface ProjectAgg {
  projectId: string;
  projectName: string;
  currency: string;
  expectedFee: number;
  expectedHours: number;
  platformFeeRate: number;
  taxRate: number;
  totalMinutes: number;
  revisionMinutes: number;
  fixedCosts: number;
}

interface Insight {
  type: "revision_heavy" | "time_overrun" | "low_profitability";
  message: string;
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { clientId } = await params;

    // Verify client ownership
    const [client] = await db
      .select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.userId, user.id),
          isNull(clients.deletedAt),
        ),
      );
    if (!client) throw new ApiError("NOT_FOUND", 404, "Client not found");

    // Get all projects for this client
    const projectRows = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.clientId, clientId),
          eq(projects.userId, user.id),
          isNull(projects.deletedAt),
        ),
      );

    const totalProjects = projectRows.length;

    if (totalProjects < 2) {
      return NextResponse.json({
        data: {
          hasData: false,
          clientName: client.name,
          totalProjects,
        },
      });
    }

    const projectIds = projectRows.map((p) => p.id);

    // Parallel: time aggregation + cost aggregation
    const [timeAgg, costAgg] = await Promise.all([
      db
        .select({
          projectId: timeEntries.projectId,
          totalMinutes: sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)`,
          revisionMinutes: sql<number>`COALESCE(SUM(CASE WHEN ${timeEntries.category} = 'revision' THEN ${timeEntries.minutes} ELSE 0 END), 0)`,
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
      db
        .select({
          projectId: costEntries.projectId,
          fixedCosts: sql<number>`COALESCE(SUM(${costEntries.amount}::numeric), 0)`,
        })
        .from(costEntries)
        .where(
          and(
            inArray(costEntries.projectId, projectIds),
            notInArray(costEntries.costType, ["platform_fee", "tax"]),
            isNull(costEntries.deletedAt),
          ),
        )
        .groupBy(costEntries.projectId),
    ]);

    const timeMap = new Map(timeAgg.map((r) => [r.projectId, r]));
    const costMap = new Map(costAgg.map((r) => [r.projectId, r]));

    // Build per-project aggregates
    const aggs: ProjectAgg[] = projectRows.map((p) => {
      const time = timeMap.get(p.id);
      const cost = costMap.get(p.id);
      return {
        projectId: p.id,
        projectName: p.name,
        currency: p.currency,
        expectedFee: Number(p.expectedFee) || 0,
        expectedHours: Number(p.expectedHours) || 0,
        platformFeeRate: Number(p.platformFeeRate) || 0,
        taxRate: Number(p.taxRate) || 0,
        totalMinutes: Number(time?.totalMinutes) || 0,
        revisionMinutes: Number(time?.revisionMinutes) || 0,
        fixedCosts: Number(cost?.fixedCosts) || 0,
      };
    });

    // Calculate per-project metrics
    let totalRevisionRate = 0;
    let totalOverrunRate = 0;
    let totalRealHourly = 0;
    let projectsWithTime = 0;
    let projectsWithHours = 0;
    let projectsWithOverrun = 0;
    // For recommended rate calculation
    let avgCommission = 0;
    let avgTax = 0;

    for (const a of aggs) {
      const totalHours = a.totalMinutes / 60;
      avgCommission += a.platformFeeRate;
      avgTax += a.taxRate;

      if (a.totalMinutes > 0) {
        totalRevisionRate += a.revisionMinutes / a.totalMinutes;
        projectsWithTime++;

        // Real hourly: net / hours
        const gross = a.expectedFee;
        const afterComm = gross * (1 - a.platformFeeRate);
        const afterTax = afterComm * (1 - a.taxRate);
        const net = afterTax - a.fixedCosts;
        const realHourly = totalHours > 0 ? net / totalHours : 0;
        totalRealHourly += realHourly;
      }

      if (a.expectedHours > 0 && a.totalMinutes > 0) {
        totalOverrunRate += totalHours / a.expectedHours;
        projectsWithOverrun++;
      }

      if (a.expectedHours > 0) {
        projectsWithHours++;
      }
    }

    const avgRevisionRate =
      projectsWithTime > 0
        ? Math.round((totalRevisionRate / projectsWithTime) * 100)
        : 0;
    const avgTimeOverrun =
      projectsWithOverrun > 0
        ? Math.round((totalOverrunRate / projectsWithOverrun) * 100)
        : 0;
    const avgRealHourlyRate =
      projectsWithTime > 0
        ? Math.round((totalRealHourly / projectsWithTime) * 100) / 100
        : null;
    avgCommission = avgCommission / totalProjects;
    avgTax = avgTax / totalProjects;

    // Primary currency (most common)
    const currencyCounts = new Map<string, number>();
    for (const a of aggs) {
      currencyCounts.set(a.currency, (currencyCounts.get(a.currency) ?? 0) + 1);
    }
    const currency = [...currencyCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "USD";

    // Rule-based insights
    const insights: Insight[] = [];
    if (avgRevisionRate > 30) {
      insights.push({ type: "revision_heavy", message: "revision_heavy" });
    }
    if (avgTimeOverrun > 150) {
      insights.push({ type: "time_overrun", message: "time_overrun" });
    }
    if (avgRealHourlyRate !== null && avgRealHourlyRate < getThreshold(currency)) {
      insights.push({ type: "low_profitability", message: "low_profitability" });
    }

    // Recommended rate: targetRate × avgOverrunRate / (1 - commission) / (1 - tax)
    const targetRate = getTargetRate(currency);
    const overrunMultiplier = avgTimeOverrun > 0 ? avgTimeOverrun / 100 : 1;
    const commissionDivisor = 1 - avgCommission;
    const taxDivisor = 1 - avgTax;
    const recommendedHourlyRate =
      commissionDivisor > 0 && taxDivisor > 0
        ? Math.round((targetRate * overrunMultiplier) / commissionDivisor / taxDivisor * 100) / 100
        : null;

    return NextResponse.json({
      data: {
        hasData: true,
        clientName: client.name,
        totalProjects,
        avgRevisionRate,
        avgTimeOverrun,
        avgRealHourlyRate,
        currency,
        insights: insights.map((i) => i.message),
        recommendedHourlyRate,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Currency-aware thresholds for "low profitability" insight
function getThreshold(currency: string): number {
  const thresholds: Record<string, number> = {
    KRW: 20000,
    USD: 15,
    EUR: 14,
    GBP: 12,
    JPY: 2200,
  };
  return thresholds[currency] ?? 15;
}

// Target rate for recommended rate calculation
function getTargetRate(currency: string): number {
  const targets: Record<string, number> = {
    KRW: 40000,
    USD: 30,
    EUR: 28,
    GBP: 24,
    JPY: 4500,
  };
  return targets[currency] ?? 30;
}
