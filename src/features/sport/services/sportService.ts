import { supabase } from "@/lib/supabase";

export async function fetchWorkoutSessions(userId: string, date: string) {
  const { data, error } = await supabase.from("workout_sessions").select("*").eq("user_id", userId).eq("session_date", date);
  if (error) throw error;
  return data ?? [];
}

export async function fetchWeeklyWorkouts(userId: string) {
  const { data, error } = await supabase.from("workout_sessions").select("*").eq("user_id", userId).order("session_date", { ascending: false }).limit(30);
  if (error) throw error;
  return data ?? [];
}
