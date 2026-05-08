import { supabase } from "@/lib/supabase";

export async function fetchMealsByDate(userId: string, date: string) {
  const { data, error } = await supabase.from("meals").select("*").eq("user_id", userId).eq("meal_date", date);
  if (error) throw error;
  return data ?? [];
}

export async function searchFoodItems(query: string) {
  const { data, error } = await supabase.from("food_items").select("*").ilike("name", `%${query}%`).limit(20);
  if (error) throw error;
  return data ?? [];
}
