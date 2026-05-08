import type { GoalType, Sex } from "@/types";

export function calculateBMR(weight: number, height: number, age: number, sex: Sex): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateTDEE(bmr: number, activityLevel: number): number {
  return bmr * activityLevel;
}

export function calculateActivityLevel(trainingFrequency: number, dailySteps: number): number {
  if (trainingFrequency >= 6 || dailySteps >= 12000) return 1.9;
  if (trainingFrequency >= 5 || dailySteps >= 10000) return 1.725;
  if (trainingFrequency >= 3 || dailySteps >= 7500) return 1.55;
  if (trainingFrequency >= 2 || dailySteps >= 5000) return 1.375;
  return 1.2;
}

export function calculateTargetCalories(tdee: number, goalType: GoalType): number {
  switch (goalType) {
    case "weight_loss":
      return tdee * 0.8;
    case "muscle_gain":
      return tdee * 1.12;
    case "recomposition":
      return tdee * 0.95;
    case "performance":
    case "endurance":
      return tdee * 1.05;
    case "maintenance":
    case "lifestyle":
    default:
      return tdee;
  }
}

export function calculateMacros(targetCalories: number, weight: number, goalType: GoalType) {
  const proteinPerKg = goalType === "weight_loss" ? 1.6 : goalType === "muscle_gain" ? 2.0 : 1.8;
  const protein = proteinPerKg * weight;
  const fats = 0.9 * weight;
  const proteinCalories = protein * 4;
  const fatCalories = fats * 9;
  const carbs = Math.max(0, (targetCalories - proteinCalories - fatCalories) / 4);

  return { protein, carbs, fats };
}

export function calculateSetVolume(weight: number, reps: number): number {
  return weight * reps;
}

export function calculateExerciseVolume(sets: Array<{ weight: number; reps: number }>): number {
  return sets.reduce((acc, set) => acc + calculateSetVolume(set.weight, set.reps), 0);
}

export function calculateWeeklyVolume(sessions: Array<{ sets: Array<{ weight: number; reps: number }> }>): number {
  return sessions.reduce((acc, session) => acc + calculateExerciseVolume(session.sets), 0);
}

export function calculateProgressPercentage(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function calculateAdherence(completed: number, planned: number): number {
  if (planned === 0) return 0;
  return (completed / planned) * 100;
}
