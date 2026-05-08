import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export type SessionExerciseRow = {
  id: string;
  session_id: string;
  exercise_name: string;
  order_index: number;
  notes: string | null;
};

export type ExerciseSetRow = {
  id: string;
  performed_exercise_id: string;
  set_number: number;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  is_completed: boolean;
};

const EXERCISE_COLUMNS = "id,session_id,exercise_name,order_index,notes";
const SET_COLUMNS = "id,performed_exercise_id,set_number,weight,reps,rpe,is_completed";

export async function getSessionExercises(
  supabase: SupabaseClient<Database>,
  userId: string,
  sessionId: string,
): Promise<{ exercises: SessionExerciseRow[]; sets: ExerciseSetRow[] }> {
  const { data: exercises, error: exercisesError } = await supabase
    .from("performed_exercises")
    .select(EXERCISE_COLUMNS)
    .eq("user_id", userId)
    .eq("session_id", sessionId)
    .order("order_index", { ascending: true });

  if (exercisesError) throw exercisesError;

  const exerciseIds = (exercises ?? []).map((row) => row.id);
  if (exerciseIds.length === 0)
    return { exercises: (exercises ?? []) as SessionExerciseRow[], sets: [] };

  const { data: sets, error: setsError } = await supabase
    .from("exercise_sets")
    .select(SET_COLUMNS)
    .eq("user_id", userId)
    .in("performed_exercise_id", exerciseIds)
    .order("set_number", { ascending: true });

  if (setsError) throw setsError;
  return {
    exercises: (exercises ?? []) as SessionExerciseRow[],
    sets: (sets ?? []) as ExerciseSetRow[],
  };
}
