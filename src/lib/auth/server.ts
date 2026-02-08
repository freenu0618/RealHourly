import { createServerSupabaseClient } from "@/lib/supabase/server";
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
    throw new Response(
      JSON.stringify({
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
  return user;
}
