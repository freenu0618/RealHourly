import { db } from "@/db";
import { projectShares, projects } from "@/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import { projectShareToDTO } from "./dto";

export async function createShare(
  projectId: string,
  userId: string,
  data: {
    label?: string;
    expiresAt?: string;
    showTimeDetails?: boolean;
    showCategoryBreakdown?: boolean;
    showProgress?: boolean;
    showInvoiceDownload?: boolean;
  },
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
  if (!project) return null;

  const [share] = await db
    .insert(projectShares)
    .values({
      projectId,
      label: data.label ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      showTimeDetails: data.showTimeDetails ?? true,
      showCategoryBreakdown: data.showCategoryBreakdown ?? true,
      showProgress: data.showProgress ?? true,
      showInvoiceDownload: data.showInvoiceDownload ?? false,
    })
    .returning();

  return projectShareToDTO(share);
}

export async function getSharesByProject(projectId: string, userId: string) {
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
  if (!project) return null;

  const rows = await db
    .select()
    .from(projectShares)
    .where(
      and(
        eq(projectShares.projectId, projectId),
        isNull(projectShares.deletedAt),
      ),
    )
    .orderBy(sql`${projectShares.createdAt} DESC`);

  return rows.map(projectShareToDTO);
}

export async function updateShare(
  shareId: string,
  userId: string,
  data: {
    label?: string | null;
    expiresAt?: string | null;
    showTimeDetails?: boolean;
    showCategoryBreakdown?: boolean;
    showProgress?: boolean;
    showInvoiceDownload?: boolean;
  },
) {
  // Verify ownership via join
  const [existing] = await db
    .select({ shareId: projectShares.id })
    .from(projectShares)
    .innerJoin(projects, eq(projectShares.projectId, projects.id))
    .where(
      and(
        eq(projectShares.id, shareId),
        eq(projects.userId, userId),
        isNull(projectShares.deletedAt),
      ),
    );
  if (!existing) return null;

  const setData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (data.label !== undefined) setData.label = data.label;
  if (data.expiresAt !== undefined)
    setData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  if (data.showTimeDetails !== undefined)
    setData.showTimeDetails = data.showTimeDetails;
  if (data.showCategoryBreakdown !== undefined)
    setData.showCategoryBreakdown = data.showCategoryBreakdown;
  if (data.showProgress !== undefined) setData.showProgress = data.showProgress;
  if (data.showInvoiceDownload !== undefined)
    setData.showInvoiceDownload = data.showInvoiceDownload;

  const [updated] = await db
    .update(projectShares)
    .set(setData)
    .where(eq(projectShares.id, shareId))
    .returning();

  return projectShareToDTO(updated);
}

export async function revokeShare(shareId: string, userId: string) {
  const [existing] = await db
    .select({ shareId: projectShares.id })
    .from(projectShares)
    .innerJoin(projects, eq(projectShares.projectId, projects.id))
    .where(
      and(
        eq(projectShares.id, shareId),
        eq(projects.userId, userId),
        isNull(projectShares.deletedAt),
      ),
    );
  if (!existing) return null;

  const [updated] = await db
    .update(projectShares)
    .set({ isRevoked: true, updatedAt: new Date() })
    .where(eq(projectShares.id, shareId))
    .returning();

  return projectShareToDTO(updated);
}

export async function getShareByToken(token: string) {
  const [share] = await db
    .select()
    .from(projectShares)
    .where(
      and(
        eq(projectShares.shareToken, token),
        isNull(projectShares.deletedAt),
      ),
    );
  return share ?? null;
}

export async function incrementAccessCount(shareId: string) {
  await db
    .update(projectShares)
    .set({
      accessCount: sql`${projectShares.accessCount} + 1`,
      lastAccessedAt: new Date(),
    })
    .where(eq(projectShares.id, shareId));
}
