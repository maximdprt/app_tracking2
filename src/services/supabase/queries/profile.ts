import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Profile } from "@/types/domain";

type Client = SupabaseClient<Database>;

export async function getProfile(client: Client, userId: string): Promise<Profile | null> {
  const { data, error } = await client
    .from("users_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertProfile(
  client: Client,
  payload: Database["public"]["Tables"]["users_profiles"]["Insert"],
): Promise<Profile> {
  const { data, error } = await client
    .from("users_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
