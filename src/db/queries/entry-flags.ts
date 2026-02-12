import { eq, and, isNull, inArray } from "drizzle-orm";
import { db } from "@/db";
import { entryFlags, timeEntries, projects } from "@/db/schema";

function toISOString(val: unknown): string | null {
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "string") return val;
  return null;
}

function flagToDTO(row: typeof entryFlags.$inferSelect) {
  return {
    id: row.id,
    timeEntryId: row.timeEntryId,
    flagType: row.flagType,
    severity: row.severity,
    metadata: row.metadata as Record<string, unknown> | null,
    createdAt: toISOString(row.createdAt),
    dismissedAt: toISOString(row.dismissedAt),
  };
}

export async function createFlags(
  flags: {
    timeEntryId: string;
    flagType: typeof entryFlags.$inferInsert.flagType;
    severity: typeof entryFlags.$inferInsert.severity;
    metadata?: Record<string, unknown>;
  }[],
) {
  if (flags.length === 0) return [];
  const rows = await db
    .insert(entryFlags)
    .values(
      flags.map((f) => ({
        timeEntryId: f.timeEntryId,
        flagType: f.flagType,
        severity: f.severity,
        metadata: f.metadata ?? null,
      })),
    )
    .returning();
  return rows.map(flagToDTO);
}

export async function getFlagsByProject(userId: string, projectId: string) {
  // Verify ownership
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
  if (!proj) return [];

  const entryIds = await db
    .select({ id: timeEntries.id })
    .from(timeEntries)
    .where(
      and(
        eq(timeEntries.projectId, projectId),
        isNull(timeEntries.deletedAt),
      ),
    );

  if (entryIds.length === 0) return [];

  const rows = await db
    .select()
    .from(entryFlags)
    .where(
      and(
        inArray(
          entryFlags.timeEntryId,
          entryIds.map((e) => e.id),
        ),
        isNull(entryFlags.dismissedAt),
      ),
    );

  return rows.map(flagToDTO);
}

export async function getFlagsByEntryIds(entryIds: string[]) {
  if (entryIds.length === 0) return [];
  const rows = await db
    .select()
    .from(entryFlags)
    .where(
      and(
        inArray(entryFlags.timeEntryId, entryIds),
        isNull(entryFlags.dismissedAt),
      ),
    );
  return rows.map(flagToDTO);
}

export async function dismissFlag(flagId: string, userId: string) {
  // Verify ownership through entry → project chain
  const [flag] = await db
    .select({
      id: entryFlags.id,
      timeEntryId: entryFlags.timeEntryId,
    })
    .from(entryFlags)
    .where(and(eq(entryFlags.id, flagId), isNull(entryFlags.dismissedAt)));

  if (!flag) return false;

  const [entry] = await db
    .select({ projectId: timeEntries.projectId })
    .from(timeEntries)
    .where(eq(timeEntries.id, flag.timeEntryId));

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

  await db
    .update(entryFlags)
    .set({ dismissedAt: new Date() })
    .where(eq(entryFlags.id, flagId));

  return true;
}
