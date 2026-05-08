import { SupabaseClient } from "@supabase/supabase-js";
import { Database, TablesInsert } from "@/types/database";

const MEAL_COLUMNS =
  "id,meal_date,meal_type,total_calories,total_protein,total_carbs,total_fats,notes,created_at";

const INGREDIENT_COLUMNS =
  "id,meal_id,food_item_id,custom_food_name,grams,calories,protein,carbs,fats,created_at";

export type MealRow = {
  id: string;
  meal_date: string;
  meal_type: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes: string | null;
  created_at: string;
};

export type IngredientRow = {
  id: string;
  meal_id: string;
  food_item_id: string | null;
  custom_food_name: string | null;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: string;
};

export async function getMealsByDate(
  supabase: SupabaseClient<Database>,
  userId: string,
  date: string,
): Promise<{ meals: MealRow[]; ingredients: IngredientRow[] }> {
  const { data: meals, error: mealsError } = await supabase
    .from("meals")
    .select(MEAL_COLUMNS)
    .eq("user_id", userId)
    .eq("meal_date", date)
    .order("created_at", { ascending: false });

  if (mealsError) throw mealsError;

  const mealIds = (meals ?? []).map((meal) => meal.id);
  if (mealIds.length === 0) return { meals: (meals ?? []) as MealRow[], ingredients: [] };

  const { data: ingredients, error: ingredientsError } = await supabase
    .from("meal_ingredients")
    .select(INGREDIENT_COLUMNS)
    .eq("user_id", userId)
    .in("meal_id", mealIds)
    .order("created_at", { ascending: true });

  if (ingredientsError) throw ingredientsError;

  return { meals: (meals ?? []) as MealRow[], ingredients: (ingredients ?? []) as IngredientRow[] };
}

export async function createMealWithIngredients(
  supabase: SupabaseClient<Database>,
  meal: TablesInsert<"meals">,
  ingredients: Omit<TablesInsert<"meal_ingredients">, "meal_id">[],
): Promise<void> {
  const { data: mealRow, error: mealError } = await supabase
    .from("meals")
    .insert(meal)
    .select("id")
    .single();

  if (mealError) throw mealError;

  const payload = ingredients.map((item) => ({ ...item, meal_id: mealRow.id }));
  const { error: ingredientsError } = await supabase.from("meal_ingredients").insert(payload);
  if (ingredientsError) throw ingredientsError;
}

export async function deleteMeal(
  supabase: SupabaseClient<Database>,
  userId: string,
  mealId: string,
): Promise<void> {
  const { error } = await supabase.from("meals").delete().eq("user_id", userId).eq("id", mealId);
  if (error) throw error;
}
