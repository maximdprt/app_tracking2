import { supabase } from "@/src/services/supabase";
import type { FoodItem } from "@/src/types/food";

export async function searchFoodItems(query: string): Promise<FoodItem[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from("food_items")
    .select("id, nom, calories_100g, proteines_100g, glucides_100g, lipides_100g, sucres_100g, fibres_100g, sel_100g, source")
    .ilike("nom", `%${query}%`)
    .limit(20);

  if (error) throw error;
  return (data ?? []) as FoodItem[];
}
