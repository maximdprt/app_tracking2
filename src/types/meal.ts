import type { EntityBase } from "@/src/types/common";

export interface Meal extends EntityBase {
  user_id: string;
  meal_date: string;
  meal_type: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface MealIngredient extends EntityBase {
  meal_id: string;
  user_id: string;
  food_item_id: string | null;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}
