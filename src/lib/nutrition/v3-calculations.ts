/**
 * Lift V3 — calculs alignés sur le brief produit (objectifs + activité nommage V3).
 * Coexiste avec `calculations.ts` (types domaine existants). Préférer ce module pour les nouveaux écrans V3.
 */

export type SexV3 = "male" | "female";

export type ActivityLevelV3 =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export const ACTIVITY_MULTIPLIERS_V3: Record<ActivityLevelV3, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
} as const;

export type GoalV3 = "cut_aggressive" | "cut" | "maintain" | "lean_bulk" | "bulk";

export type DietPreferenceV3 = "balanced" | "low_carb" | "high_carb" | "keto";

export function calculateBMRV3(params: {
  weight_kg: number;
  height_cm: number;
  age_years: number;
  sex: SexV3;
}): number {
  const { weight_kg, height_cm, age_years, sex } = params;
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age_years;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateTDEEv3(
  bmr: number,
  activity: ActivityLevelV3,
): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS_V3[activity]);
}

export function calculateTargetCaloriesV3(tdee: number, goal: GoalV3): number {
  const adj: Record<GoalV3, number> = {
    cut_aggressive: -0.25,
    cut: -0.15,
    maintain: 0,
    lean_bulk: 0.1,
    bulk: 0.2,
  };
  return Math.round(tdee * (1 + adj[goal]));
}

export function calculateMacrosV3(params: {
  target_kcal: number;
  weight_kg: number;
  goal: GoalV3;
  diet_preference?: DietPreferenceV3;
}): { proteins_g: number; carbs_g: number; fats_g: number; fiber_g: number } {
  const {
    target_kcal,
    weight_kg,
    goal,
    diet_preference = "balanced",
  } = params;

  const proteinPerKg: Record<GoalV3, number> = {
    cut_aggressive: 2.4,
    cut: 2.2,
    maintain: 1.8,
    lean_bulk: 1.8,
    bulk: 1.6,
  };

  const proteins_g = Math.round(weight_kg * proteinPerKg[goal]);

  const fatPct: Record<DietPreferenceV3, number> = {
    balanced: 0.27,
    low_carb: 0.4,
    high_carb: 0.2,
    keto: 0.7,
  };

  const fats_g = Math.round((target_kcal * fatPct[diet_preference]) / 9);
  const carbs_g = Math.max(
    0,
    Math.round((target_kcal - proteins_g * 4 - fats_g * 9) / 4),
  );
  const fiber_g = Math.round((target_kcal / 1000) * 14);

  return { proteins_g, carbs_g, fats_g, fiber_g };
}
