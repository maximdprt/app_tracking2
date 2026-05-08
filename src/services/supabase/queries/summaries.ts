import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export type DailySummaryRow = {
  id: string;
  summary_date: string;
  sport_summary: string | null;
  food_summary: string | null;
  global_summary: string | null;
  updated_at: string;
};

const COLUMNS = "id,summary_date,sport_summary,food_summary,global_summary,updated_at";

export async function getSummaryByDate(
  supabase: SupabaseClient<Database>,
  userId: string,
  date: string,
): Promise<DailySummaryRow | null> {
  const { data, error } = await supabase
    .from("daily_summaries")
    .select(COLUMNS)
    .eq("user_id", userId)
    .eq("summary_date", date)
    .maybeSingle();

  if (error) throw error;
  return data as DailySummaryRow | null;
}
