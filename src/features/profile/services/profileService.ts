import { supabase } from "@/lib/supabase";

export async function updateProfile(userId: string, payload: Record<string, unknown>) {
  const { error } = await supabase.from("users_profiles").update(payload).eq("user_id", userId);
  if (error) throw error;
}
