import { supabase } from "@/src/services/supabase";

export async function getWorkoutSessions(userId: string) {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("session_date", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}
