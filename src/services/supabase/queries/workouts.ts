import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export type WorkoutSessionRow = {
  id: string;
  workout_name: string | null;
  session_date: string;
  status: string;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
};

const SESSION_COLUMNS = "id,workout_name,session_date,status,duration_minutes,notes,created_at";

export async function getRecentSessions(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 10,
): Promise<WorkoutSessionRow[]> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(SESSION_COLUMNS)
    .eq("user_id", userId)
    .order("session_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as WorkoutSessionRow[];
}
