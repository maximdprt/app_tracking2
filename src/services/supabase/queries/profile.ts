import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Tables, TablesInsert } from "@/types/database";

type ProfileRow = Tables<"users_profiles">;
type ProfileInsert = TablesInsert<"users_profiles">;

const PROFILE_COLUMNS =
  "id,user_id,height,weight,age,sex,experience_level,goal_type,goal_duration_weeks,training_frequency,average_steps,average_sleep_hours,current_daily_calories,target_daily_calories,target_protein,target_carbs,target_fats,created_at,updated_at";

export async function getProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("users_profiles")
    .select(PROFILE_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertProfile(
  supabase: SupabaseClient<Database>,
  payload: ProfileInsert,
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from("users_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select(PROFILE_COLUMNS)
    .single();

  if (error) throw error;
  return data;
}
