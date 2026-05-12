import type { GoalType, MacroResult, Sex } from "@/types/domain";
import {
  ACTIVITY_MULTIPLIERS,
  FAT_KCAL_RATIO,
  GOAL_DEFINITIONS,
  PROTEIN_PER_KG,
} from "@/constants/nutrition";

export function calculateBMR(weight: number, height: number, age: number, sex: Sex): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

export function calculateActivityLevel(
  trainingFrequency: number,
): keyof typeof ACTIVITY_MULTIPLIERS {
  if (trainingFrequency <= 1) return "sedentary";
  if (trainingFrequency <= 3) return "light";
  if (trainingFrequency <= 5) return "moderate";
  if (trainingFrequency === 6) return "intense";
  return "veryIntense";
}

export function calculateTDEE(bmr: number, level: keyof typeof ACTIVITY_MULTIPLIERS): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[level]);
}

export function calculateMacros(tdee: number, goalType: GoalType, weight: number): MacroResult {
  const definition = GOAL_DEFINITIONS[goalType] ?? GOAL_DEFINITIONS.maintenance;
  const targetCalories = Math.round(tdee * (1 + definition.deficit));

  const protein = Math.round(weight * PROTEIN_PER_KG);
  const fats = Math.round((targetCalories * FAT_KCAL_RATIO) / 9);
  const proteinKcal = protein * 4;
  const fatKcal = fats * 9;
  const carbsKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbs = Math.round(carbsKcal / 4);

  return { targetCalories, protein, carbs, fats };
}

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
