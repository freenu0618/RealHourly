import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError } from "@/lib/api/errors";
import { ensureProfile } from "@/db/queries/profiles";
import type { User } from "@supabase/supabase-js";

export async function getUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) {
    throw new ApiError("UNAUTHORIZED", 401, "Authentication required");
  }

  // Ensure profile row exists (covers social signup without DB trigger)
  await ensureProfile(user.id);

  return user;
}
