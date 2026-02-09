import { eq } from "drizzle-orm";
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
