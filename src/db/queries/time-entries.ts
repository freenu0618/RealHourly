import { eq, and, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { timeEntries } from "@/db/schema";
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
