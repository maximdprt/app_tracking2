import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = user.id;

  const [
    users_profiles,
    meals,
    meal_ingredients,
    habits,
    habit_logs,
    habit_off_days,
    daily_summaries,
    sleep_logs,
    steps_logs,
    weight_logs,
    workout_programs,
    workout_days,
    workout_sessions,
    performed_exercises,
    exercise_sets,
    workout_metrics,
    user_streaks,
    planned_exercises,
    user_custom_foods,
    user_food_favorites,
    consent_log,
    meal_photo_analyses,
    chat_threads,
  ] = await Promise.all([
    supabase.from("users_profiles").select("*").eq("user_id", uid).maybeSingle(),
    supabase.from("meals").select("*").eq("user_id", uid),
    supabase.from("meal_ingredients").select("*").eq("user_id", uid),
    supabase.from("habits").select("*").eq("user_id", uid),
    supabase.from("habit_logs").select("*").eq("user_id", uid),
    supabase.from("habit_off_days").select("*").eq("user_id", uid),
    supabase.from("daily_summaries").select("*").eq("user_id", uid),
    supabase.from("sleep_logs").select("*").eq("user_id", uid),
    supabase.from("steps_logs").select("*").eq("user_id", uid),
    supabase.from("weight_logs").select("*").eq("user_id", uid),
    supabase.from("workout_programs").select("*").eq("user_id", uid),
    supabase.from("workout_days").select("*").eq("user_id", uid),
    supabase.from("workout_sessions").select("*").eq("user_id", uid),
    supabase.from("performed_exercises").select("*").eq("user_id", uid),
    supabase.from("exercise_sets").select("*").eq("user_id", uid),
    supabase.from("workout_metrics").select("*").eq("user_id", uid),
    supabase.from("user_streaks").select("*").eq("user_id", uid),
    supabase.from("planned_exercises").select("*").eq("user_id", uid),
    supabase.from("user_custom_foods").select("*").eq("user_id", uid),
    supabase.from("user_food_favorites").select("*").eq("user_id", uid),
    supabase.from("consent_log").select("*").eq("user_id", uid),
    supabase.from("meal_photo_analyses").select("*").eq("user_id", uid),
    supabase.from("chat_threads").select("*").eq("user_id", uid),
  ]);

  const threadIds = (chat_threads.data ?? []).map((t) => t.id);
  let chat_messages: unknown[] = [];
  if (threadIds.length > 0) {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .in("thread_id", threadIds);
    if (!error) chat_messages = data ?? [];
  }

  const exportPayload = {
    exported_at: new Date().toISOString(),
    user_id: uid,
    users_profiles: users_profiles.data ?? null,
    meals: meals.data ?? [],
    meal_ingredients: meal_ingredients.data ?? [],
    habits: habits.data ?? [],
    habit_logs: habit_logs.data ?? [],
    habit_off_days: habit_off_days.data ?? [],
    daily_summaries: daily_summaries.data ?? [],
    sleep_logs: sleep_logs.data ?? [],
    steps_logs: steps_logs.data ?? [],
    weight_logs: weight_logs.data ?? [],
    workout_programs: workout_programs.data ?? [],
    workout_days: workout_days.data ?? [],
    workout_sessions: workout_sessions.data ?? [],
    performed_exercises: performed_exercises.data ?? [],
    exercise_sets: exercise_sets.data ?? [],
    workout_metrics: workout_metrics.data ?? [],
    user_streaks: user_streaks.data ?? [],
    planned_exercises: planned_exercises.data ?? [],
    user_custom_foods: user_custom_foods.data ?? [],
    user_food_favorites: user_food_favorites.data ?? [],
    consent_log: consent_log.data ?? [],
    meal_photo_analyses: meal_photo_analyses.data ?? [],
    chat_threads: chat_threads.data ?? [],
    chat_messages,
  };

  return NextResponse.json(exportPayload, {
    headers: {
      "Content-Disposition": `attachment; filename="lift-export-${uid.slice(0, 8)}.json"`,
    },
  });
}
