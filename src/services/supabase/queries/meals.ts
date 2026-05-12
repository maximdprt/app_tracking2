import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Meal, MealIngredient, MealWithIngredients } from "@/types/domain";

type Client = SupabaseClient<Database>;
type MealInsert = Database["public"]["Tables"]["meals"]["Insert"];
type IngredientInsert = Database["public"]["Tables"]["meal_ingredients"]["Insert"];

export async function getMealsByDate(
  client: Client,
  userId: string,
  date: string,
): Promise<MealWithIngredients[]> {
  const { data: meals, error: mealsError } = await client
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .eq("meal_date", date)
    .order("created_at", { ascending: true });

  if (mealsError) throw mealsError;
  if (!meals || meals.length === 0) return [];

  const mealIds = meals.map((m) => m.id);
  const { data: ingredients, error: ingError } = await client
    .from("meal_ingredients")
    .select("*")
    .in("meal_id", mealIds);

  if (ingError) throw ingError;

  return meals.map((m) => ({
    ...m,
    ingredients: (ingredients ?? []).filter((i) => i.meal_id === m.id),
  }));
}

export async function createMealWithIngredients(
  client: Client,
  meal: MealInsert,
  ingredients: Omit<IngredientInsert, "meal_id">[],
): Promise<Meal> {
  const { data: createdMeal, error: mealError } = await client
    .from("meals")
    .insert(meal)
    .select("*")
    .single();
  if (mealError) throw mealError;

  if (ingredients.length > 0) {
    const payload: IngredientInsert[] = ingredients.map((i) => ({ ...i, meal_id: createdMeal.id }));
    const { error: ingError } = await client.from("meal_ingredients").insert(payload);
    if (ingError) throw ingError;
  }

  return createdMeal;
}

export async function deleteMeal(client: Client, mealId: string): Promise<void> {
  const { error } = await client.from("meals").delete().eq("id", mealId);
  if (error) throw error;
}

export async function deleteIngredient(client: Client, ingredientId: string): Promise<void> {
  const { error } = await client.from("meal_ingredients").delete().eq("id", ingredientId);
  if (error) throw error;
}

export async function recalculateMealTotals(client: Client, mealId: string): Promise<void> {
  const { data: ingredients, error } = await client
    .from("meal_ingredients")
    .select("calories, protein, carbs, fats")
    .eq("meal_id", mealId);
  if (error) throw error;

  const totals = (ingredients ?? []).reduce(
    (acc, i) => ({
      calories: acc.calories + (i.calories ?? 0),
      protein: acc.protein + (i.protein ?? 0),
      carbs: acc.carbs + (i.carbs ?? 0),
      fats: acc.fats + (i.fats ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );

  const { error: updateError } = await client
    .from("meals")
    .update({
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fats: totals.fats,
    })
    .eq("id", mealId);
  if (updateError) throw updateError;
}
