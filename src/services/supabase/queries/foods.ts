import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export type FoodSearchRow = {
  id: string;
  name: string | null;
  nom: string;
  aliases: string[];
  category: string | null;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fats_per_100g: number | null;
  calories_100g: number;
  proteines_100g: number;
  glucides_100g: number;
  lipides_100g: number;
};

const FOOD_COLUMNS =
  "id,name,nom,aliases,category,calories_per_100g,protein_per_100g,carbs_per_100g,fats_per_100g,calories_100g,proteines_100g,glucides_100g,lipides_100g";

export async function searchFoods(
  supabase: SupabaseClient<Database>,
  query: string,
  limit = 20,
): Promise<FoodSearchRow[]> {
  const term = query.trim();
  if (!term) return [];

  const { data, error } = await supabase
    .from("food_items")
    .select(FOOD_COLUMNS)
    .or(`name.ilike.%${term}%,nom.ilike.%${term}%,aliases.cs.{${term}}`)
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as FoodSearchRow[];
}
