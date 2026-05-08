import { supabase } from "@/src/services/supabase";

// TODO: implement createMeal with ingredient aggregation and transaction-like flow.
export async function getMealsByDate(userId: string, mealDate: string) {
  const { data, error } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .eq("meal_date", mealDate);

  if (error) throw error;
  return data ?? [];
}
