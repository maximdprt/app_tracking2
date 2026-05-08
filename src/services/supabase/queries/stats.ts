import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { calculateVolume } from "@/utils/workouts";

export type WeeklyVolumePoint = { week: string; volume: number };

export async function getWeeklyVolume(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<WeeklyVolumePoint[]> {
  const { data, error } = await supabase
    .from("exercise_sets")
    .select("weight,reps,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const map = new Map<string, { weight: number | null; reps: number | null }[]>();
  (data ?? []).forEach((row) => {
    const week = row.created_at.slice(0, 10);
    const bucket = map.get(week) ?? [];
    bucket.push({ weight: row.weight, reps: row.reps });
    map.set(week, bucket);
  });

  return Array.from(map.entries()).map(([week, rows]) => ({ week, volume: calculateVolume(rows) }));
}
