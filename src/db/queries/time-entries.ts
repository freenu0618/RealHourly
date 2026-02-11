import { eq, and, isNull, sql, gte, lte, inArray, desc } from "drizzle-orm";
import { db } from "@/db";
import { timeEntries, projects, clients } from "@/db/schema";
import { timeEntryToDTO } from "./dto";
import type { SaveTimeEntryInput } from "@/lib/validators/time";

export async function saveTimeEntries(entries: SaveTimeEntryInput[]) {
  const values = entries.map((e) => ({
    projectId: e.projectId,
    date: e.date,
    minutes: e.minutes,
    category: e.category as typeof timeEntries.$inferInsert.category,
    intent: (e.intent ?? "done") as typeof timeEntries.$inferInsert.intent,
    taskDescription: e.taskDescription,
    sourceText: e.sourceText ?? null,
    issues: e.issues ?? [],
  }));

  const rows = await db.insert(timeEntries).values(values).returning();
  return rows.map(timeEntryToDTO);
}

export async function getTimeEntriesByProject(
  projectId: string,
  opts?: { intent?: "done" | "planned" },
) {
  const conditions = [
    eq(timeEntries.projectId, projectId),
    isNull(timeEntries.deletedAt),
  ];
  if (opts?.intent) {
    conditions.push(eq(timeEntries.intent, opts.intent));
  }
  const rows = await db
    .select()
    .from(timeEntries)
    .where(and(...conditions));
  return rows.map(timeEntryToDTO);
}

export async function getSumMinutesByProject(
  projectId: string,
  intent: "done" | "planned" = "done",
): Promise<number> {
  const [result] = await db
    .select({ total: sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)` })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.projectId, projectId),
        eq(timeEntries.intent, intent),
        isNull(timeEntries.deletedAt),
      ),
    );
  return Number(result.total);
}

export async function getTimeHistory(
  userId: string,
  opts: { from: string; to: string; projectId?: string; category?: string },
) {
  // Get user's project IDs first
  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      clientId: projects.clientId,
    })
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
      ),
    );

  if (userProjects.length === 0) {
    return {
      entries: [],
      summary: { totalMinutes: 0, totalEntries: 0, byCategory: [], byProject: [] },
    };
  }

  const projectIds = userProjects.map((p) => p.id);
  const projectMap = new Map(userProjects.map((p) => [p.id, p]));

  // Get client names
  const clientIds = userProjects.map((p) => p.clientId).filter(Boolean) as string[];
  const clientMap = new Map<string, string>();
  if (clientIds.length > 0) {
    const clientRows = await db
      .select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(and(inArray(clients.id, clientIds), isNull(clients.deletedAt)));
    for (const c of clientRows) {
      clientMap.set(c.id, c.name);
    }
  }

  // Build conditions
  const conditions = [
    inArray(timeEntries.projectId, projectIds),
    isNull(timeEntries.deletedAt),
    gte(timeEntries.date, opts.from),
    lte(timeEntries.date, opts.to),
  ];
  if (opts.projectId) {
    conditions.push(eq(timeEntries.projectId, opts.projectId));
  }
  if (opts.category) {
    conditions.push(
      eq(
        timeEntries.category,
        opts.category as typeof timeEntries.$inferInsert.category,
      ),
    );
  }

  const rows = await db
    .select()
    .from(timeEntries)
    .where(and(...conditions))
    .orderBy(desc(timeEntries.date), desc(timeEntries.createdAt));

  // Build entries with project/client info
  const entries = rows.map((r) => {
    const proj = projectMap.get(r.projectId);
    const clientName = proj?.clientId ? (clientMap.get(proj.clientId) ?? null) : null;
    return {
      id: r.id,
      date: r.date,
      minutes: r.minutes,
      category: r.category,
      intent: r.intent,
      taskDescription: r.taskDescription,
      projectId: r.projectId,
      projectName: proj?.name ?? "",
      clientName,
    };
  });

  // Summary
  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0);
  const totalEntries = entries.length;

  const byCategoryMap = new Map<string, { minutes: number; count: number }>();
  for (const e of entries) {
    const existing = byCategoryMap.get(e.category) ?? { minutes: 0, count: 0 };
    existing.minutes += e.minutes;
    existing.count += 1;
    byCategoryMap.set(e.category, existing);
  }
  const byCategory = Array.from(byCategoryMap.entries()).map(([category, v]) => ({
    category,
    minutes: v.minutes,
    count: v.count,
  }));

  const byProjectMap = new Map<string, { projectName: string; minutes: number }>();
  for (const e of entries) {
    const existing = byProjectMap.get(e.projectId) ?? { projectName: e.projectName, minutes: 0 };
    existing.minutes += e.minutes;
    byProjectMap.set(e.projectId, existing);
  }
  const byProject = Array.from(byProjectMap.entries()).map(([projectId, v]) => ({
    projectId,
    projectName: v.projectName,
    minutes: v.minutes,
  }));

  return {
    entries,
    summary: { totalMinutes, totalEntries, byCategory, byProject },
  };
}

export async function getRecentCategoriesByProject(
  projectId: string,
  limit = 10,
): Promise<string[]> {
  const rows = await db
    .select({ category: timeEntries.category })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.projectId, projectId),
        eq(timeEntries.intent, "done"),
        isNull(timeEntries.deletedAt),
      ),
    )
    .orderBy(desc(timeEntries.createdAt))
    .limit(limit);
  return rows.map((r) => r.category);
}

export async function getDayTotalMinutes(
  projectIds: string[],
  date: string,
): Promise<number> {
  if (projectIds.length === 0) return 0;
  const [result] = await db
    .select({ total: sql<number>`COALESCE(SUM(${timeEntries.minutes}), 0)` })
    .from(timeEntries)
    .where(
      and(
        inArray(timeEntries.projectId, projectIds),
        eq(timeEntries.date, date),
        eq(timeEntries.intent, "done"),
        isNull(timeEntries.deletedAt),
      ),
    );
  return Number(result.total);
}

export async function updateTimeEntry(
  entryId: string,
  userId: string,
  data: {
    date?: string;
    minutes?: number;
    category?: string;
    taskDescription?: string;
    intent?: string;
  },
) {
  // Verify ownership through project
  const [entry] = await db
    .select({ id: timeEntries.id, projectId: timeEntries.projectId })
    .from(timeEntries)
    .where(and(eq(timeEntries.id, entryId), isNull(timeEntries.deletedAt)));

  if (!entry) return null;

  const [proj] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, entry.projectId),
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
      ),
    );

  if (!proj) return null;

  const setData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.date !== undefined) setData.date = data.date;
  if (data.minutes !== undefined) setData.minutes = data.minutes;
  if (data.category !== undefined) setData.category = data.category;
  if (data.taskDescription !== undefined) setData.taskDescription = data.taskDescription;
  if (data.intent !== undefined) setData.intent = data.intent;

  const [row] = await db
    .update(timeEntries)
    .set(setData)
    .where(eq(timeEntries.id, entryId))
    .returning();

  return row ? timeEntryToDTO(row) : null;
}

export async function softDeleteTimeEntry(entryId: string, userId: string) {
  // Verify ownership through project
  const [entry] = await db
    .select({ id: timeEntries.id, projectId: timeEntries.projectId })
    .from(timeEntries)
    .where(and(eq(timeEntries.id, entryId), isNull(timeEntries.deletedAt)));

  if (!entry) return false;

  const [proj] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, entry.projectId),
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
      ),
    );

  if (!proj) return false;

  const [row] = await db
    .update(timeEntries)
    .set({ deletedAt: new Date() })
    .where(eq(timeEntries.id, entryId))
    .returning();

  return !!row;
}
