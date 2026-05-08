import { supabase } from "@/lib/supabase";

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase.from("users_profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data;
}
