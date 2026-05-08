import type { FoodItem } from "@/src/types/food";

export interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugar: number;
  fiber: number;
  salt: number;
}

export function calculateMacrosFromFood(food: FoodItem, grams: number): MacroResult {
  const ratio = grams / 100;

  return {
    calories: food.calories_100g * ratio,
    protein: food.proteines_100g * ratio,
    carbs: food.glucides_100g * ratio,
    fats: food.lipides_100g * ratio,
    sugar: food.sucres_100g * ratio,
    fiber: food.fibres_100g * ratio,
    salt: food.sel_100g * ratio,
  };
}
