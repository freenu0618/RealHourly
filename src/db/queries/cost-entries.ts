import { eq, and, isNull, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { costEntries, projects } from "@/db/schema";
import { costEntryToDTO } from "./dto";
import type { CreateCostInput, UpdateCostInput } from "@/lib/validators/costs";
import { ApiError } from "@/lib/api/errors";

export async function getCostEntriesByProject(projectId: string) {
  const rows = await db
    .select()
    .from(costEntries)
    .where(
      and(
        eq(costEntries.projectId, projectId),
        isNull(costEntries.deletedAt),
      ),
    );
  return rows.map(costEntryToDTO);
}

export async function createCostEntry(
  projectId: string,
  userId: string,
  data: CreateCostInput,
) {
  // Verify project ownership
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
      ),
    );
  if (!project) throw new ApiError("NOT_FOUND", 404, "Project not found");

  const [row] = await db
    .insert(costEntries)
    .values({
      projectId,
      amount: String(data.amount),
      costType: data.costType,
      date: data.date ?? null,
      notes: data.notes ?? null,
    })
    .returning();
  return costEntryToDTO(row);
}

export async function updateCostEntry(
  costEntryId: string,
  userId: string,
  data: UpdateCostInput,
) {
  // Verify ownership via project join
  const [existing] = await db
    .select({ id: costEntries.id })
    .from(costEntries)
    .innerJoin(projects, eq(costEntries.projectId, projects.id))
    .where(
      and(
        eq(costEntries.id, costEntryId),
        eq(projects.userId, userId),
        isNull(costEntries.deletedAt),
      ),
    );
  if (!existing) throw new ApiError("NOT_FOUND", 404, "Cost entry not found");

  const setData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.amount !== undefined) setData.amount = String(data.amount);
  if (data.costType !== undefined) setData.costType = data.costType;
  if (data.date !== undefined) setData.date = data.date;
  if (data.notes !== undefined) setData.notes = data.notes;

  const [row] = await db
    .update(costEntries)
    .set(setData)
    .where(eq(costEntries.id, costEntryId))
    .returning();
  return costEntryToDTO(row);
}

export async function softDeleteCostEntry(
  costEntryId: string,
  userId: string,
) {
  const [existing] = await db
    .select({ id: costEntries.id })
    .from(costEntries)
    .innerJoin(projects, eq(costEntries.projectId, projects.id))
    .where(
      and(
        eq(costEntries.id, costEntryId),
        eq(projects.userId, userId),
        isNull(costEntries.deletedAt),
      ),
    );
  if (!existing) return false;

  await db
    .update(costEntries)
    .set({ deletedAt: new Date() })
    .where(eq(costEntries.id, costEntryId));
  return true;
}

export async function getSumFixedCostsByProject(
  projectId: string,
): Promise<number> {
  const [result] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${costEntries.amount}::numeric), 0)`,
    })
    .from(costEntries)
    .where(
      and(
        eq(costEntries.projectId, projectId),
        notInArray(costEntries.costType, ["platform_fee", "tax"]),
        isNull(costEntries.deletedAt),
      ),
    );
  return Number(result.total);
}
