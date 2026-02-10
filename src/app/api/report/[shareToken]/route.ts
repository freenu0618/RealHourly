import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, profiles, timeEntries, projectShares } from "@/db/schema";
import { eq, and, isNull, asc, sql } from "drizzle-orm";
import { getCategoryEmoji } from "@/lib/utils/category-emoji";
import { publicReportRateLimit } from "@/lib/api/rate-limit";
import { incrementAccessCount } from "@/db/queries/project-shares";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ shareToken: string }> },
) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { success, retryAfterMs } = await publicReportRateLimit.check(ip);
  if (!success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests" } },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      },
    );
  }

  const { shareToken } = await params;

  // 1. Fetch share + project + profile in one query
  const [shareRow] = await db
    .select({
      share: projectShares,
      project: {
        id: projects.id,
        name: projects.name,
        userId: projects.userId,
        startDate: projects.startDate,
        currency: projects.currency,
        progressPercent: projects.progressPercent,
        status: projects.status,
        deletedAt: projects.deletedAt,
      },
    })
    .from(projectShares)
    .innerJoin(projects, eq(projectShares.projectId, projects.id))
    .where(
      and(
        eq(projectShares.shareToken, shareToken),
        isNull(projectShares.deletedAt),
      ),
    );

  // 2. Validate existence
  if (!shareRow || shareRow.project.deletedAt !== null) {
    return NextResponse.json(
      { error: { code: "SHARE_NOT_FOUND", message: "Report not found" } },
      { status: 404 },
    );
  }

  const { share, project } = shareRow;

  // 3. Check revoked
  if (share.isRevoked) {
    return NextResponse.json(
      {
        error: {
          code: "SHARE_REVOKED",
          message: "This report has been deactivated",
        },
      },
      { status: 410 },
    );
  }

  // 4. Check expired
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return NextResponse.json(
      {
        error: { code: "SHARE_EXPIRED", message: "This report has expired" },
      },
      { status: 410 },
    );
  }

  // 5. Fetch freelancer name
  const [profile] = await db
    .select({ displayName: profiles.displayName })
    .from(profiles)
    .where(eq(profiles.id, project.userId));

  const freelancerName = profile?.displayName ?? "Freelancer";

  // 6. Fetch time entries (only done intent, not deleted)
  const entries = await db
    .select({
      date: timeEntries.date,
      minutes: timeEntries.minutes,
      category: timeEntries.category,
      taskDescription: timeEntries.taskDescription,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.projectId, project.id),
        eq(timeEntries.intent, "done"),
        isNull(timeEntries.deletedAt),
      ),
    )
    .orderBy(asc(timeEntries.date));

  // 7. Build summary
  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
  const totalEntries = entries.length;
  const dates = entries.map((e) => e.date);
  const dateRange = {
    from: dates[0] ?? "",
    to: dates[dates.length - 1] ?? "",
  };

  // 8. Build timeline (grouped by date, most recent first)
  let timeline: Array<{
    date: string;
    entries: Array<{
      category: string;
      categoryEmoji: string;
      minutes: number;
      taskDescription: string;
    }>;
    dayTotalMinutes: number;
  }> | null = null;

  if (share.showTimeDetails) {
    const grouped = new Map<
      string,
      Array<{
        category: string;
        categoryEmoji: string;
        minutes: number;
        taskDescription: string;
      }>
    >();

    for (const entry of entries) {
      const day = entry.date;
      if (!grouped.has(day)) grouped.set(day, []);
      grouped.get(day)!.push({
        category: entry.category,
        categoryEmoji: getCategoryEmoji(entry.category),
        minutes: entry.minutes,
        taskDescription: entry.taskDescription,
      });
    }

    timeline = Array.from(grouped.entries())
      .sort((a, b) => b[0].localeCompare(a[0])) // most recent first
      .map(([date, dayEntries]) => ({
        date,
        entries: dayEntries,
        dayTotalMinutes: dayEntries.reduce((s, e) => s + e.minutes, 0),
      }));
  }

  // 9. Build category breakdown
  let categoryBreakdown: Array<{
    category: string;
    categoryEmoji: string;
    totalMinutes: number;
    percentage: number;
  }> | null = null;

  if (share.showCategoryBreakdown) {
    const catMap = new Map<string, number>();
    for (const entry of entries) {
      catMap.set(
        entry.category,
        (catMap.get(entry.category) ?? 0) + entry.minutes,
      );
    }
    categoryBreakdown = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1]) // descending by minutes
      .map(([category, mins]) => ({
        category,
        categoryEmoji: getCategoryEmoji(category),
        totalMinutes: mins,
        percentage:
          totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0,
      }));
  }

  // 10. Increment access count (fire-and-forget)
  void incrementAccessCount(share.id);

  // 11. Build response — NEVER include sensitive data
  const report = {
    project: {
      name: project.name,
      freelancerName,
      startDate: project.startDate,
      currency: project.currency,
      progressPercent: share.showProgress ? project.progressPercent : null,
      status: project.status,
    },
    summary: {
      totalHours,
      totalEntries,
      dateRange,
    },
    timeline,
    categoryBreakdown,
    invoiceAvailable: share.showInvoiceDownload,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(
    { data: report },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    },
  );
}
