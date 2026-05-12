import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { FoodItem } from "@/types/domain";

type Client = SupabaseClient<Database>;

export async function searchFoods(
  client: Client,
  query: string,
  limit = 20,
): Promise<FoodItem[]> {
  if (query.trim().length === 0) return [];
  const { data, error } = await client
    .from("food_items")
    .select("*")
    .ilike("name", `%${query}%`)
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as FoodItem[];
}
