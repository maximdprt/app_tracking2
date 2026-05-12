import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { DailySummary } from "@/types/domain";

type Client = SupabaseClient<Database>;

export async function getDailySummary(
  client: Client,
  userId: string,
  date: string,
): Promise<DailySummary | null> {
  const { data, error } = await client
    .from("daily_summaries")
    .select("*")
    .eq("user_id", userId)
    .eq("summary_date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertDailySummary(
  client: Client,
  userId: string,
  date: string,
  globalSummary: string,
): Promise<DailySummary> {
  const { data, error } = await client
    .from("daily_summaries")
    .upsert(
      {
        user_id: userId,
        summary_date: date,
        global_summary: globalSummary,
        sport_summary: globalSummary,
        food_summary: globalSummary,
      },
      { onConflict: "user_id,summary_date" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getRecentSummaries(
  client: Client,
  userId: string,
  limit = 7,
): Promise<DailySummary[]> {
  const { data, error } = await client
    .from("daily_summaries")
    .select("*")
    .eq("user_id", userId)
    .order("summary_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
