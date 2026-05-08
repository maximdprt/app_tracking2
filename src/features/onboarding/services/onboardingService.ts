import { supabase } from "@/lib/supabase";

export async function upsertUserProfile(payload: Record<string, unknown>) {
  const { error } = await supabase.from("users_profiles").upsert(payload, { onConflict: "user_id" });
  if (error) throw error;
}
