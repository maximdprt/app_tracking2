import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { e1RMCombined } from "@/lib/nutrition/e1rm";

type Client = SupabaseClient<Database>;
// Tables not yet in generated types — bypass strict typing until migration applied
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Untyped = { from: (t: string) => any; rpc: (fn: string, args?: any) => any };

export interface WorkoutMetric {
  id: string;
  user_id: string;
  exercise_name: string;
  session_id: string | null;
  session_date: string;
  top_set_kg: number | null;
  top_set_reps: number | null;
  e1rm_kg: number | null;
  volume_kg: number | null;
  sets_count: number | null;
  rpe_avg: number | null;
  created_at: string;
}

export interface AutoProgressSuggestion {
  exerciseName: string;
  suggestion: "increase_weight" | "increase_reps" | "increase_sets" | "deload" | "maintain";
  detail: string;
  lastE1rm: number | null;
  previousE1rm: number | null;
}

/**
 * Insère ou met à jour les métriques d'un exercice après une séance.
 * Calcule automatiquement le e1RM via la formule d'Epley.
 */
export async function upsertWorkoutMetrics(
  client: Client,
  params: {
    userId: string;
    exerciseName: string;
    sessionId: string;
    sessionDate: string;
    sets: { weight: number | null; reps: number | null }[];
  },
): Promise<void> {
  const { userId, exerciseName, sessionId, sessionDate, sets } = params;

  const completedSets = sets.filter(
    (s) => s.weight !== null && s.reps !== null && s.weight > 0 && s.reps > 0,
  ) as { weight: number; reps: number }[];

  if (completedSets.length === 0) return;

  // Best set by e1RM
  const ranked = completedSets
    .map((s) => ({ ...s, e1rm: e1RMCombined(s.weight, s.reps).value }))
    .sort((a, b) => b.e1rm - a.e1rm);

  const best = ranked[0]!;
  const volume = completedSets.reduce((acc, s) => acc + s.weight * s.reps, 0);

  const { error } = await (client as unknown as Untyped).from("workout_metrics").insert({
    user_id: userId,
    exercise_name: exerciseName,
    session_id: sessionId,
    session_date: sessionDate,
    top_set_kg: best.weight,
    top_set_reps: best.reps,
    e1rm_kg: Math.round(best.e1rm * 10) / 10,
    volume_kg: Math.round(volume * 10) / 10,
    sets_count: completedSets.length,
  });

  if (error) {
    // Table pas encore migrée → silencieux
    if (error.code === "42P01" || /does not exist/i.test(error.message)) return;
    console.warn("[workoutMetrics] insert error:", error.message);
  }
}

/**
 * Retourne les N dernières métriques pour un exercice donné.
 */
export async function getExerciseMetricsHistory(
  client: Client,
  userId: string,
  exerciseName: string,
  limit = 10,
): Promise<WorkoutMetric[]> {
  const { data, error } = await (client as unknown as Untyped)
    .from("workout_metrics")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_name", exerciseName)
    .order("session_date", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  return (data ?? []) as unknown as WorkoutMetric[];
}

/**
 * Analyse les 2 dernières séances d'un exercice et propose une progression.
 *
 * Règles :
 * - Si l'e1RM a progressé ≥ 5% → "increase_weight" (charge +2.5kg)
 * - Si l'e1RM est stable (< 5% de variation) et reps ≥ target → "increase_weight"
 * - Si l'e1RM a régressé > 10% → "deload"
 * - Sinon → "maintain"
 */
export async function getAutoProgressSuggestion(
  client: Client,
  userId: string,
  exerciseName: string,
): Promise<AutoProgressSuggestion | null> {
  const history = await getExerciseMetricsHistory(client, userId, exerciseName, 3);
  if (history.length < 1) return null;

  const last = history[0]!;
  const prev = history[1] ?? null;

  const lastE1rm = last.e1rm_kg;
  const prevE1rm = prev?.e1rm_kg ?? null;

  if (!lastE1rm) return null;

  let suggestion: AutoProgressSuggestion["suggestion"] = "maintain";
  let detail = "Continue sur ta lancée.";

  if (prevE1rm) {
    const delta = (lastE1rm - prevE1rm) / prevE1rm;
    if (delta >= 0.05) {
      suggestion = "increase_weight";
      detail = `e1RM en hausse de ${Math.round(delta * 100)}% → essaie +2.5kg à la prochaine séance.`;
    } else if (delta <= -0.1) {
      suggestion = "deload";
      detail = `e1RM en baisse de ${Math.round(Math.abs(delta) * 100)}% → envisage une semaine de déload (-40% volume).`;
    } else if (last.top_set_reps !== null && last.top_set_reps >= 12) {
      suggestion = "increase_weight";
      detail = `Tu fais ${last.top_set_reps} reps → augmente la charge de 2.5-5kg.`;
    } else {
      suggestion = "maintain";
      detail = `Performance stable. Continue et cherche à améliorer la technique.`;
    }
  } else if (last.top_set_reps !== null && last.top_set_reps >= 12) {
    suggestion = "increase_weight";
    detail = `${last.top_set_reps} reps → augmente la charge pour rester dans ta zone d'hypertrophie.`;
  }

  return { exerciseName, suggestion, detail, lastE1rm, previousE1rm: prevE1rm };
}
