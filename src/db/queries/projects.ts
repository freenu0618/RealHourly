import { eq, and, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { projects, clients, costEntries } from "@/db/schema";
import { projectToDTO } from "./dto";
import {
  PRESET_RATES,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/validators/projects";

export async function getProjectsByUserId(
  userId: string,
  opts?: { active?: boolean; status?: string },
) {
  const conditions = [eq(projects.userId, userId), isNull(projects.deletedAt)];
  if (opts?.status) {
    conditions.push(sql`${projects.status} = ${opts.status}`);
  } else if (opts?.active !== undefined) {
    conditions.push(eq(projects.isActive, opts.active));
  }
  const rows = await db
    .select()
    .from(projects)
    .where(and(...conditions));
  return rows.map(projectToDTO);
}

export async function getProjectById(projectId: string, userId: string) {
  const [row] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
      ),
    );
  return row ? projectToDTO(row) : null;
}

export async function createProject(
  userId: string,
  data: CreateProjectInput,
) {
  const platformFeeRate =
    data.platformFeePreset === "custom"
      ? (data.platformFeeRate ?? 0)
      : (PRESET_RATES[data.platformFeePreset] ?? 0);

  const taxRate = data.taxEnabled ? (data.taxRate ?? 0.033) : 0;

  const [row] = await db
    .insert(projects)
    .values({
      userId,
      clientId: data.clientId,
      name: data.name,
      aliases: data.aliases ?? [],
      expectedFee: String(data.expectedFee),
      expectedHours: String(data.expectedHours),
      currency: data.currency,
      platformFeeRate: String(platformFeeRate),
      taxRate: String(taxRate),
    })
    .returning();

  if (data.fixedCostAmount && data.fixedCostAmount > 0) {
    await db.insert(costEntries).values({
      projectId: row.id,
      amount: String(data.fixedCostAmount),
      costType: data.fixedCostType ?? "misc",
    });
  }

  return projectToDTO(row);
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: UpdateProjectInput,
) {
  const setData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) setData.name = data.name;
  if (data.aliases !== undefined) setData.aliases = data.aliases;
  if (data.expectedFee !== undefined)
    setData.expectedFee = String(data.expectedFee);
  if (data.expectedHours !== undefined)
    setData.expectedHours = String(data.expectedHours);
  if (data.currency !== undefined) setData.currency = data.currency;
  if (data.platformFeeRate !== undefined)
    setData.platformFeeRate = String(data.platformFeeRate);
  if (data.taxRate !== undefined) setData.taxRate = String(data.taxRate);
  if (data.progressPercent !== undefined)
    setData.progressPercent = data.progressPercent;
  if (data.isActive !== undefined) setData.isActive = data.isActive;

  // Handle status transitions
  if (data.status !== undefined) {
    setData.status = data.status;
    if (data.status === "completed") {
      setData.progressPercent = 100;
      setData.completedAt = new Date();
      setData.isActive = false;
    } else if (data.status === "active") {
      setData.completedAt = null;
      setData.isActive = true;
    } else {
      // paused, cancelled
      setData.isActive = false;
      if (data.status === "cancelled") {
        setData.completedAt = new Date();
      }
    }
  }

  const [row] = await db
    .update(projects)
    .set(setData)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
      ),
    )
    .returning();
  return row ? projectToDTO(row) : null;
}

export async function softDeleteProject(projectId: string, userId: string) {
  const [row] = await db
    .update(projects)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
      ),
    )
    .returning();
  return !!row;
}

export async function getActiveProjectsForMatching(
  userId: string,
  limit: number = 20,
) {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      aliases: projects.aliases,
      clientName: clients.name,
    })
    .from(projects)
    .leftJoin(
      clients,
      and(eq(projects.clientId, clients.id), isNull(clients.deletedAt)),
    )
    .where(
      and(
        eq(projects.userId, userId),
        eq(projects.status, "active"),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(sql`${projects.updatedAt} DESC`)
    .limit(limit);
  return rows;
}
