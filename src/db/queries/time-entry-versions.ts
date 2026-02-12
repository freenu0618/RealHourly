import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { timeEntryVersions } from "@/db/schema";

function toISOString(val: unknown): string | null {
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "string") return val;
  return null;
}

export async function recordVersion(
  timeEntryId: string,
  changedBy: string,
  changeType: "create" | "update" | "delete",
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null,
) {
  const [row] = await db
    .insert(timeEntryVersions)
    .values({ timeEntryId, changedBy, changeType, oldValues, newValues })
    .returning();
  return row;
}

export async function getEntryHistory(timeEntryId: string) {
  const rows = await db
    .select()
    .from(timeEntryVersions)
    .where(eq(timeEntryVersions.timeEntryId, timeEntryId))
    .orderBy(desc(timeEntryVersions.changedAt));

  return rows.map((r) => ({
    id: r.id,
    timeEntryId: r.timeEntryId,
    changedBy: r.changedBy,
    changedAt: toISOString(r.changedAt),
    changeType: r.changeType,
    oldValues: r.oldValues as Record<string, unknown> | null,
    newValues: r.newValues as Record<string, unknown> | null,
  }));
}
