import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  WorkoutSession,
  WorkoutProgram,
  WorkoutDay,
  PlannedExercise,
  SessionWithExercises,
} from "@/types/domain";

type Client = SupabaseClient<Database>;
type SessionInsert = Database["public"]["Tables"]["workout_sessions"]["Insert"];

export async function getRecentSessions(
  client: Client,
  userId: string,
  limit = 10,
): Promise<WorkoutSession[]> {
  const { data, error } = await client
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("session_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getSessionWithExercises(
  client: Client,
  sessionId: string,
  userId: string,
): Promise<SessionWithExercises | null> {
  const { data: session, error: sessionError } = await client
    .from("workout_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (sessionError) throw sessionError;
  if (!session) return null;

  const { data: exercises, error: exError } = await client
    .from("performed_exercises")
    .select("*")
    .eq("session_id", sessionId)
    .order("order_index", { ascending: true });
  if (exError) throw exError;

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  const { data: sets, error: setsError } =
    exerciseIds.length > 0
      ? await client
          .from("exercise_sets")
          .select("*")
          .in("performed_exercise_id", exerciseIds)
          .order("set_number", { ascending: true })
      : { data: [], error: null };
  if (setsError) throw setsError;

  return {
    ...session,
    exercises: (exercises ?? []).map((e) => ({
      ...e,
      sets: (sets ?? []).filter((s) => s.performed_exercise_id === e.id),
    })),
  };
}

export async function createSession(client: Client, payload: SessionInsert): Promise<WorkoutSession> {
  const { data, error } = await client.from("workout_sessions").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function completeSession(
  client: Client,
  sessionId: string,
  durationMinutes: number,
): Promise<void> {
  const { error } = await client
    .from("workout_sessions")
    .update({ status: "completed", duration_minutes: durationMinutes })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function getPrograms(client: Client, userId: string): Promise<WorkoutProgram[]> {
  const { data, error } = await client
    .from("workout_programs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProgramDays(
  client: Client,
  programId: string,
): Promise<{ days: WorkoutDay[]; planned: PlannedExercise[] }> {
  const { data: days, error: daysError } = await client
    .from("workout_days")
    .select("*")
    .eq("program_id", programId)
    .order("day_of_week", { ascending: true });
  if (daysError) throw daysError;

  const dayIds = (days ?? []).map((d) => d.id);
  const { data: planned, error: plannedError } =
    dayIds.length > 0
      ? await client
          .from("planned_exercises")
          .select("*")
          .in("workout_day_id", dayIds)
          .order("order_index", { ascending: true })
      : { data: [], error: null };
  if (plannedError) throw plannedError;

  return { days: days ?? [], planned: planned ?? [] };
}
