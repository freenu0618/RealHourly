import { eq, and, isNull, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  timesheets,
  timesheetApprovals,
  timeEntries,
  projects,
  profiles,
} from "@/db/schema";

// ── DTO helpers ─────────────────────────────────────────────

function toISOString(val: unknown): string | null {
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "string") return val;
  return null;
}

function timesheetToDTO(row: typeof timesheets.$inferSelect) {
  return {
    id: row.id,
    projectId: row.projectId,
    userId: row.userId,
    weekStart: row.weekStart,
    weekEnd: row.weekEnd,
    status: row.status,
    submittedAt: toISOString(row.submittedAt),
    approvedAt: toISOString(row.approvedAt),
    rejectedAt: toISOString(row.rejectedAt),
    reviewerNote: row.reviewerNote,
    totalMinutes: row.totalMinutes,
    createdAt: toISOString(row.createdAt),
    updatedAt: toISOString(row.updatedAt),
  };
}

// ── Queries ─────────────────────────────────────────────────

export async function createTimesheet(
  userId: string,
  projectId: string,
  weekStart: string,
  weekEnd: string,
) {
  // Verify project ownership
  const [proj] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
      ),
    );
  if (!proj) return null;

  // Check duplicate
  const [existing] = await db
    .select({ id: timesheets.id })
    .from(timesheets)
    .where(
      and(
        eq(timesheets.projectId, projectId),
        eq(timesheets.weekStart, weekStart),
        isNull(timesheets.deletedAt),
      ),
    );
  if (existing) return { duplicate: true, id: existing.id };

  // Calculate total minutes for the week
  const [minuteResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)`,
    })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.projectId, projectId),
        sql`${timeEntries.date} >= ${weekStart}`,
        sql`${timeEntries.date} <= ${weekEnd}`,
        eq(timeEntries.intent, "done"),
        isNull(timeEntries.deletedAt),
      ),
    );

  const [row] = await db
    .insert(timesheets)
    .values({
      projectId,
      userId,
      weekStart,
      weekEnd,
      totalMinutes: Number(minuteResult.total),
    })
    .returning();

  // Link time entries to this timesheet
  await db
    .update(timeEntries)
    .set({ timesheetId: row.id, updatedAt: new Date() })
    .where(
      and(
        eq(timeEntries.projectId, projectId),
        sql`${timeEntries.date} >= ${weekStart}`,
        sql`${timeEntries.date} <= ${weekEnd}`,
        isNull(timeEntries.deletedAt),
        isNull(timeEntries.timesheetId),
      ),
    );

  return timesheetToDTO(row);
}

export async function getTimesheetsByUser(
  userId: string,
  opts?: { projectId?: string; status?: string },
) {
  const conditions = [
    eq(timesheets.userId, userId),
    isNull(timesheets.deletedAt),
  ];
  if (opts?.projectId) {
    conditions.push(eq(timesheets.projectId, opts.projectId));
  }
  if (opts?.status) {
    conditions.push(
      eq(
        timesheets.status,
        opts.status as "draft" | "submitted" | "approved" | "rejected",
      ),
    );
  }

  const rows = await db
    .select({
      timesheet: timesheets,
      projectName: projects.name,
    })
    .from(timesheets)
    .innerJoin(projects, eq(timesheets.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(desc(timesheets.weekStart));

  return rows.map((r) => ({
    ...timesheetToDTO(r.timesheet),
    projectName: r.projectName,
  }));
}

export async function getTimesheetById(timesheetId: string, userId: string) {
  const [row] = await db
    .select({
      timesheet: timesheets,
      projectName: projects.name,
      projectCurrency: projects.currency,
    })
    .from(timesheets)
    .innerJoin(projects, eq(timesheets.projectId, projects.id))
    .where(
      and(
        eq(timesheets.id, timesheetId),
        eq(timesheets.userId, userId),
        isNull(timesheets.deletedAt),
      ),
    );

  if (!row) return null;

  // Get linked entries
  const entries = await db
    .select()
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.timesheetId, timesheetId),
        isNull(timeEntries.deletedAt),
      ),
    )
    .orderBy(timeEntries.date, timeEntries.createdAt);

  return {
    ...timesheetToDTO(row.timesheet),
    projectName: row.projectName,
    projectCurrency: row.projectCurrency,
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date,
      minutes: e.minutes,
      category: e.category,
      intent: e.intent,
      taskDescription: e.taskDescription,
      lockedAt: toISOString(e.lockedAt),
    })),
  };
}

export async function submitTimesheet(timesheetId: string, userId: string) {
  const [ts] = await db
    .select()
    .from(timesheets)
    .where(
      and(
        eq(timesheets.id, timesheetId),
        eq(timesheets.userId, userId),
        eq(timesheets.status, "draft"),
        isNull(timesheets.deletedAt),
      ),
    );
  if (!ts) return null;

  // Create approval record with review token
  const [approval] = await db
    .insert(timesheetApprovals)
    .values({
      timesheetId,
      action: "submitted",
    })
    .returning();

  // Update status
  const [updated] = await db
    .update(timesheets)
    .set({
      status: "submitted",
      submittedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(timesheets.id, timesheetId))
    .returning();

  return {
    ...timesheetToDTO(updated),
    reviewToken: approval.reviewerToken,
  };
}

export async function getTimesheetByReviewToken(token: string) {
  const [approval] = await db
    .select()
    .from(timesheetApprovals)
    .where(eq(timesheetApprovals.reviewerToken, token));

  if (!approval) return null;

  const [row] = await db
    .select({
      timesheet: timesheets,
      projectName: projects.name,
      projectCurrency: projects.currency,
      userName: profiles.displayName,
    })
    .from(timesheets)
    .innerJoin(projects, eq(timesheets.projectId, projects.id))
    .innerJoin(profiles, eq(timesheets.userId, profiles.id))
    .where(
      and(
        eq(timesheets.id, approval.timesheetId),
        isNull(timesheets.deletedAt),
      ),
    );

  if (!row) return null;

  // Get entries with flags
  const entries = await db
    .select()
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.timesheetId, approval.timesheetId),
        isNull(timeEntries.deletedAt),
      ),
    )
    .orderBy(timeEntries.date, timeEntries.createdAt);

  return {
    ...timesheetToDTO(row.timesheet),
    projectName: row.projectName,
    projectCurrency: row.projectCurrency,
    freelancerName: row.userName,
    approvalId: approval.id,
    approvalAction: approval.action,
    entries: entries.map((e) => ({
      id: e.id,
      date: e.date,
      minutes: e.minutes,
      category: e.category,
      intent: e.intent,
      taskDescription: e.taskDescription,
    })),
  };
}

export async function approveTimesheet(
  token: string,
  note?: string,
  reviewerEmail?: string,
) {
  const [approval] = await db
    .select()
    .from(timesheetApprovals)
    .where(eq(timesheetApprovals.reviewerToken, token));

  if (!approval) return null;

  const [ts] = await db
    .select()
    .from(timesheets)
    .where(
      and(
        eq(timesheets.id, approval.timesheetId),
        eq(timesheets.status, "submitted"),
        isNull(timesheets.deletedAt),
      ),
    );
  if (!ts) return null;

  // Update approval record
  await db
    .update(timesheetApprovals)
    .set({
      action: "approved",
      note: note ?? null,
      reviewerEmail: reviewerEmail ?? null,
      actedAt: new Date(),
    })
    .where(eq(timesheetApprovals.id, approval.id));

  // Update timesheet status
  const [updated] = await db
    .update(timesheets)
    .set({
      status: "approved",
      approvedAt: new Date(),
      reviewerNote: note ?? null,
      updatedAt: new Date(),
    })
    .where(eq(timesheets.id, ts.id))
    .returning();

  // Lock all linked time entries
  await db
    .update(timeEntries)
    .set({ lockedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(timeEntries.timesheetId, ts.id),
        isNull(timeEntries.deletedAt),
      ),
    );

  return timesheetToDTO(updated);
}

export async function rejectTimesheet(
  token: string,
  note?: string,
  reviewerEmail?: string,
) {
  const [approval] = await db
    .select()
    .from(timesheetApprovals)
    .where(eq(timesheetApprovals.reviewerToken, token));

  if (!approval) return null;

  const [ts] = await db
    .select()
    .from(timesheets)
    .where(
      and(
        eq(timesheets.id, approval.timesheetId),
        eq(timesheets.status, "submitted"),
        isNull(timesheets.deletedAt),
      ),
    );
  if (!ts) return null;

  // Update approval record
  await db
    .update(timesheetApprovals)
    .set({
      action: "rejected",
      note: note ?? null,
      reviewerEmail: reviewerEmail ?? null,
      actedAt: new Date(),
    })
    .where(eq(timesheetApprovals.id, approval.id));

  // Update timesheet status
  const [updated] = await db
    .update(timesheets)
    .set({
      status: "rejected",
      rejectedAt: new Date(),
      reviewerNote: note ?? null,
      updatedAt: new Date(),
    })
    .where(eq(timesheets.id, ts.id))
    .returning();

  return timesheetToDTO(updated);
}
