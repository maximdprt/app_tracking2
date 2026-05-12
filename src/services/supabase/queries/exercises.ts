import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ExerciseSet, PerformedExercise } from "@/types/domain";

type Client = SupabaseClient<Database>;
type ExerciseInsert = Database["public"]["Tables"]["performed_exercises"]["Insert"];
type SetInsert = Database["public"]["Tables"]["exercise_sets"]["Insert"];
type SetUpdate = Database["public"]["Tables"]["exercise_sets"]["Update"];

export async function addExercise(client: Client, payload: ExerciseInsert): Promise<PerformedExercise> {
  const { data, error } = await client.from("performed_exercises").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteExercise(client: Client, exerciseId: string): Promise<void> {
  const { error } = await client.from("performed_exercises").delete().eq("id", exerciseId);
  if (error) throw error;
}

export async function addSet(client: Client, payload: SetInsert): Promise<ExerciseSet> {
  const { data, error } = await client.from("exercise_sets").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateSet(
  client: Client,
  setId: string,
  patch: SetUpdate,
): Promise<ExerciseSet> {
  const { data, error } = await client
    .from("exercise_sets")
    .update(patch)
    .eq("id", setId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSet(client: Client, setId: string): Promise<void> {
  const { error } = await client.from("exercise_sets").delete().eq("id", setId);
  if (error) throw error;
}

export async function getExerciseHistory(
  client: Client,
  userId: string,
  exerciseName: string,
  limit = 10,
): Promise<{ session_date: string; max_volume: number; max_weight: number }[]> {
  const { data, error } = await client
    .from("performed_exercises")
    .select(
      "id, session_id, exercise_name, workout_sessions!inner(session_date), exercise_sets(weight, reps)",
    )
    .eq("user_id", userId)
    .eq("exercise_name", exerciseName)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data) return [];

  type Row = {
    workout_sessions: { session_date: string } | { session_date: string }[] | null;
    exercise_sets: { weight: number | null; reps: number | null }[] | null;
  };

  return (data as unknown as Row[])
    .map((row) => {
      const ws = Array.isArray(row.workout_sessions)
        ? row.workout_sessions[0]
        : row.workout_sessions;
      const date = ws?.session_date ?? "";
      const sets = row.exercise_sets ?? [];
      const maxVolume = sets.reduce(
        (acc, s) => Math.max(acc, (s.weight ?? 0) * (s.reps ?? 0)),
        0,
      );
      const maxWeight = sets.reduce((acc, s) => Math.max(acc, s.weight ?? 0), 0);
      return { session_date: date, max_volume: maxVolume, max_weight: maxWeight };
    })
    .filter((r) => r.session_date !== "");
}
