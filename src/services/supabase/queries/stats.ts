import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { format, parseISO, startOfWeek, subDays } from "date-fns";

type Client = SupabaseClient<Database>;

/**
 * Real weekly volume from exercise_sets * weight * reps.
 * Replaces the mock `sessions.length * 850` from the old code.
 */
export async function getWeeklyVolume(
  client: Client,
  userId: string,
  weeks = 12,
): Promise<{ week: string; volume: number }[]> {
  const since = format(subDays(new Date(), weeks * 7), "yyyy-MM-dd");

  const { data, error } = await client
    .from("exercise_sets")
    .select("weight, reps, created_at")
    .eq("user_id", userId)
    .gte("created_at", since);

  if (error) throw error;

  const buckets = new Map<string, number>();
  for (const set of data ?? []) {
    if (set.weight === null || set.reps === null) continue;
    const weekStart = format(startOfWeek(parseISO(set.created_at), { weekStartsOn: 1 }), "yyyy-MM-dd");
    const vol = set.weight * set.reps;
    buckets.set(weekStart, (buckets.get(weekStart) ?? 0) + vol);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, volume]) => ({ week, volume: Math.round(volume) }));
}

export async function getDailyCalories(
  client: Client,
  userId: string,
  days = 30,
): Promise<{ date: string; calories: number; protein: number; carbs: number; fats: number }[]> {
  const since = format(subDays(new Date(), days), "yyyy-MM-dd");

  const { data, error } = await client
    .from("meals")
    .select("meal_date, total_calories, total_protein, total_carbs, total_fats")
    .eq("user_id", userId)
    .gte("meal_date", since);

  if (error) throw error;

  const buckets = new Map<string, { calories: number; protein: number; carbs: number; fats: number }>();
  for (const meal of data ?? []) {
    const cur = buckets.get(meal.meal_date) ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };
    cur.calories += meal.total_calories;
    cur.protein += meal.total_protein;
    cur.carbs += meal.total_carbs;
    cur.fats += meal.total_fats;
    buckets.set(meal.meal_date, cur);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, totals]) => ({ date, ...totals }));
}

export async function getSessionFrequency(
  client: Client,
  userId: string,
  days = 90,
): Promise<{ date: string; count: number }[]> {
  const since = format(subDays(new Date(), days), "yyyy-MM-dd");

  const { data, error } = await client
    .from("workout_sessions")
    .select("session_date, status")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("session_date", since);

  if (error) throw error;

  const buckets = new Map<string, number>();
  for (const s of data ?? []) {
    buckets.set(s.session_date, (buckets.get(s.session_date) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export async function getWeightHistory(
  client: Client,
  userId: string,
): Promise<{ date: string; weight: number }[]> {
  const { data, error } = await client
    .from("users_profiles")
    .select("weight, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((p) => p.weight !== null)
    .map((p) => ({
      date: p.updated_at.slice(0, 10),
      weight: p.weight as number,
    }));
}
