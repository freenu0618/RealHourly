import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { generatedMessages, alerts, projects } from "@/db/schema";
import { generatedMessageToDTO } from "./dto";
import { ApiError } from "@/lib/api/errors";

export async function createMessages(
  alertId: string,
  messages: { tone: "polite" | "neutral" | "firm"; subject: string; body: string }[],
) {
  const values = messages.map((m) => ({
    alertId,
    tone: m.tone,
    subject: m.subject,
    body: m.body,
  }));
  const rows = await db.insert(generatedMessages).values(values).returning();
  return rows.map(generatedMessageToDTO);
}

export async function markMessageCopied(messageId: string, userId: string) {
  // Verify ownership via alert → project join
  const [existing] = await db
    .select({ id: generatedMessages.id })
    .from(generatedMessages)
    .innerJoin(alerts, eq(generatedMessages.alertId, alerts.id))
    .innerJoin(projects, eq(alerts.projectId, projects.id))
    .where(
      and(
        eq(generatedMessages.id, messageId),
        eq(projects.userId, userId),
        isNull(generatedMessages.deletedAt),
      ),
    );
  if (!existing)
    throw new ApiError("NOT_FOUND", 404, "Message not found");

  const now = new Date();
  const [row] = await db
    .update(generatedMessages)
    .set({ copiedAt: now, updatedAt: now })
    .where(eq(generatedMessages.id, messageId))
    .returning();
  return generatedMessageToDTO(row);
}
