import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export async function getProfile(userId: string) {
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId));
  return row ?? null;
}

export async function ensureProfile(userId: string) {
  const existing = await getProfile(userId);
  if (existing) return existing;

  const [row] = await db
    .insert(profiles)
    .values({ id: userId })
    .onConflictDoNothing()
    .returning();
  return row ?? (await getProfile(userId));
}

export async function updateProfile(
  userId: string,
  data: {
    displayName?: string | null;
    defaultCurrency?: "USD" | "KRW" | "EUR" | "GBP" | "JPY";
    hourlyGoal?: number | null;
    timezone?: string;
    locale?: string;
  },
) {
  const [row] = await db
    .update(profiles)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(profiles.id, userId))
    .returning();
  return row ?? null;
}
