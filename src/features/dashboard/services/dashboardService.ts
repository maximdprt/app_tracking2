import { supabase } from "@/lib/supabase";

export async function fetchDashboardData(userId: string, date: string) {
  const [{ data: profile }, { data: meals }, { data: sessions }] = await Promise.all([
    supabase.from("users_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("meals").select("*").eq("user_id", userId).eq("meal_date", date),
    supabase.from("workout_sessions").select("*").eq("user_id", userId).eq("session_date", date),
  ]);

  return { profile: profile ?? null, meals: meals ?? [], sessions: sessions ?? [] };
}
