import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { usageCounts } from "@/db/schema";

/** Get current YYYY-MM period string */
function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Get usage count for a feature in the current month */
export async function getUsageCount(
  userId: string,
  feature: string,
): Promise<number> {
  const period = currentPeriod();
  const [row] = await db
    .select({ count: usageCounts.count })
    .from(usageCounts)
    .where(
      and(
        eq(usageCounts.userId, userId),
        eq(usageCounts.feature, feature),
        eq(usageCounts.period, period),
      ),
    );
  return row?.count ?? 0;
}

/** Increment usage count. Returns the new count. */
export async function incrementUsage(
  userId: string,
  feature: string,
): Promise<number> {
  const period = currentPeriod();
  const [row] = await db
    .insert(usageCounts)
    .values({ userId, feature, period, count: 1 })
    .onConflictDoUpdate({
      target: [usageCounts.userId, usageCounts.feature, usageCounts.period],
      set: {
        count: sql`${usageCounts.count} + 1`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ count: usageCounts.count });
  return row.count;
}
