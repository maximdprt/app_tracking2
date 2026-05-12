/**
 * Point d'entrée unique pour les utilitaires nutritionnels.
 * - Les calculs BMR/TDEE/macros viennent de src/lib/nutrition/calculations.ts
 * - Les helpers food_items (per100g, macrosFromGrams) restent ici
 */

import type { FoodItem, GoalType, MacroResult, Sex } from "@/types/domain";
import {
  ACTIVITY_MULTIPLIERS,
  activityLevelFromFrequency,
  calculateBMR as libCalculateBMR,
  calculateTDEE as libCalculateTDEE,
  calculateMacros as libCalculateMacros,
  type ActivityLevel,
} from "@/lib/nutrition/calculations";

// ─── Ré-exports pour rétro-compatibilité ─────────────────────────────────────
export { ACTIVITY_MULTIPLIERS };

export function calculateBMR(weight: number, height: number, age: number, sex: Sex): number {
  return libCalculateBMR({ weight_kg: weight, height_cm: height, age_years: age, sex });
}

export function calculateActivityLevel(trainingFrequency: number): ActivityLevel {
  return activityLevelFromFrequency(trainingFrequency);
}

export function calculateTDEE(bmr: number, level: ActivityLevel): number {
  return libCalculateTDEE(bmr, level);
}

export function calculateMacros(tdee: number, goalType: GoalType, weight: number): MacroResult {
  return libCalculateMacros({ tdee, weight_kg: weight, goal: goalType });
}

// ─── Helpers de log alimentaire ───────────────────────────────────────────────

export function macrosFromGrams(
  grams: number,
  per100g: { calories: number; protein: number; carbs: number; fats: number },
): { calories: number; protein: number; carbs: number; fats: number } {
  const ratio = grams / 100;
  return {
    calories: per100g.calories * ratio,
    protein: per100g.protein * ratio,
    carbs: per100g.carbs * ratio,
    fats: per100g.fats * ratio,
  };
}

/**
 * Extrait les macros pour 100 g depuis un aliment.
 * Gère les deux schémas :
 *  - Nouveau (food_items refondu) : `calories_100g`, `proteines_100g`, `glucides_100g`, `lipides_100g`
 *  - Ancien (colonnes `*_per_100g`) : fallback sur les colonnes legacy `*_per_100g`
 * Cette double-vérification est volontaire pendant la période de transition.
 */
export function per100gMacrosFromFoodItem(food: FoodItem): {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
} {
  return {
    calories: food.calories_100g ?? food.calories_per_100g ?? 0,
    protein: food.proteines_100g ?? food.protein_per_100g ?? 0,
    carbs: food.glucides_100g ?? food.carbs_per_100g ?? 0,
    fats: food.lipides_100g ?? food.fats_per_100g ?? 0,
  };
}

/**
 * Version étendue incluant fibres, sucres et sel
 * (disponibles dans le schéma refondu food_items).
 */
export function per100gFullFromFoodItem(food: FoodItem): {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  salt: number;
} {
  return {
    ...per100gMacrosFromFoodItem(food),
    fiber: food.fibres_100g ?? food.fiber_per_100g ?? 0,
    sugar: food.sucres_100g ?? food.sugar_per_100g ?? 0,
    salt: food.sel_100g ?? food.salt_per_100g ?? 0,
  };
}
