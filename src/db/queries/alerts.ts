import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { alerts, projects } from "@/db/schema";
import { alertToDTO } from "./dto";
import { ApiError } from "@/lib/api/errors";

export async function getActiveAlertByProject(projectId: string) {
  const [row] = await db
    .select()
    .from(alerts)
    .where(
      and(
        eq(alerts.projectId, projectId),
        isNull(alerts.dismissedAt),
        isNull(alerts.deletedAt),
      ),
    );
  return row ? alertToDTO(row) : null;
}

export async function createAlert(
  projectId: string,
  alertType: "scope_rule1" | "scope_rule2" | "scope_rule3",
  metadata: Record<string, unknown>,
) {
  const [row] = await db
    .insert(alerts)
    .values({ projectId, alertType, metadata })
    .returning();
  return alertToDTO(row);
}

export async function dismissAlert(alertId: string, userId: string) {
  // Verify ownership via project join
  const [existing] = await db
    .select({ id: alerts.id })
    .from(alerts)
    .innerJoin(projects, eq(alerts.projectId, projects.id))
    .where(
      and(
        eq(alerts.id, alertId),
        eq(projects.userId, userId),
        isNull(alerts.dismissedAt),
        isNull(alerts.deletedAt),
      ),
    );
  if (!existing) throw new ApiError("NOT_FOUND", 404, "Alert not found");

  const now = new Date();
  const [row] = await db
    .update(alerts)
    .set({ dismissedAt: now, updatedAt: now })
    .where(eq(alerts.id, alertId))
    .returning();
  return alertToDTO(row);
}
