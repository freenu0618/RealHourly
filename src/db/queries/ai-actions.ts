import { eq, and, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { aiActions } from "@/db/schema";
import { aiActionToDTO } from "./dto";
import type {
  CreateAiActionInput,
  AiActionStatus,
} from "@/lib/validators/ai-actions";

export async function getAiActionsByUser(
  userId: string,
  status?: AiActionStatus,
) {
  const conditions = [eq(aiActions.userId, userId)];
  if (status) {
    conditions.push(sql`${aiActions.status} = ${status}`);
  }
  const rows = await db
    .select()
    .from(aiActions)
    .where(and(...conditions))
    .orderBy(desc(aiActions.createdAt));
  return rows.map(aiActionToDTO);
}

export async function getPendingCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiActions)
    .where(and(eq(aiActions.userId, userId), eq(aiActions.status, "pending")));
  return row?.count ?? 0;
}

export async function getTodayBriefing(userId: string) {
  const [row] = await db
    .select()
    .from(aiActions)
    .where(
      and(
        eq(aiActions.userId, userId),
        eq(aiActions.type, "briefing"),
        sql`${aiActions.createdAt}::date = CURRENT_DATE`,
      ),
    )
    .orderBy(desc(aiActions.createdAt))
    .limit(1);
  return row ? aiActionToDTO(row) : null;
}

export async function createAiAction(
  userId: string,
  data: CreateAiActionInput,
) {
  const [row] = await db
    .insert(aiActions)
    .values({
      userId,
      projectId: data.projectId,
      type: data.type,
      title: data.title,
      message: data.message,
      payload: data.payload,
    })
    .returning();
  return aiActionToDTO(row);
}

export async function deleteTodayBriefings(userId: string) {
  const rows = await db
    .delete(aiActions)
    .where(
      and(
        eq(aiActions.userId, userId),
        eq(aiActions.type, "briefing"),
        sql`${aiActions.createdAt}::date = CURRENT_DATE`,
      ),
    )
    .returning();
  return rows.length;
}

export async function updateAiActionStatus(
  actionId: string,
  userId: string,
  status: "approved" | "dismissed",
) {
  const [row] = await db
    .update(aiActions)
    .set({ status, actedAt: new Date() })
    .where(and(eq(aiActions.id, actionId), eq(aiActions.userId, userId)))
    .returning();
  return row ? aiActionToDTO(row) : null;
}
