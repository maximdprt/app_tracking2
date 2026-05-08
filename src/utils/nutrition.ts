import { ActivityLevel, GoalType, Sex } from "@/types/domain";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  intense: 1.725,
  very_intense: 1.9,
};

const GOAL_MULTIPLIERS: Record<GoalType, number> = {
  weight_loss: 0.8,
  recomposition: 0.9,
  maintenance: 1,
  muscle_gain: 1.1,
  performance: 1.15,
};

export function calculateBMR(weight: number, height: number, age: number, sex: Sex): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  const sexDelta = sex === "male" ? 5 : -161;
  return Math.round(base + sexDelta);
}

export function calculateActivityLevel(trainingFrequency: number): ActivityLevel {
  if (trainingFrequency <= 1) return "sedentary";
  if (trainingFrequency <= 2) return "light";
  if (trainingFrequency <= 4) return "moderate";
  if (trainingFrequency <= 6) return "intense";
  return "very_intense";
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function calculateMacros(
  tdee: number,
  goalType: GoalType,
  weightKg: number,
): {
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
} {
  const targetCalories = Math.round(tdee * GOAL_MULTIPLIERS[goalType]);
  const protein = Math.round(weightKg * 2);
  const fats = Math.round((targetCalories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((targetCalories - protein * 4 - fats * 9) / 4));

  return { targetCalories, protein, carbs, fats };
}

// Manual sanity checks:
// 1) male, 80kg, 180cm, 30y => BMR around 1780
// 2) TDEE moderate => BMR * 1.55
// 3) weight_loss => targetCalories ~ TDEE * 0.8
