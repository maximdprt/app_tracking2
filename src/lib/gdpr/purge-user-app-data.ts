import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

/** Supprime tout le contenu applicatif (RLS user) — le compte Auth reste. */
export async function purgeUserAppData(client: Client, userId: string): Promise<void> {
  {
    const { error } = await client.from("workout_metrics").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("workout_sessions").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("workout_programs").delete().eq("user_id", userId);
    if (error) throw error;
  }

  {
    const { error } = await client.from("meals").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("daily_summaries").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("sleep_logs").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("steps_logs").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("weight_logs").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("meal_photo_analyses").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("habits").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("chat_threads").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("habit_off_days").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("user_food_favorites").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("user_custom_foods").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("user_streaks").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("consent_log").delete().eq("user_id", userId);
    if (error) throw error;
  }
  {
    const { error } = await client.from("users_profiles").delete().eq("user_id", userId);
    if (error) throw error;
  }
}
