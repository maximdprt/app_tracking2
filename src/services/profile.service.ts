import { supabase } from "@/src/services/supabase";

// TODO: add optimistic update strategy for profile editing.
export async function getProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}
