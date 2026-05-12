import type { Database } from "@/types/database";

export type Sex = "male" | "female";
export type GoalType =
  | "weight_loss"
  | "recomposition"
  | "maintenance"
  | "muscle_gain"
  | "performance";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type WorkoutStatus = "planned" | "completed" | "skipped";

export type Profile = Database["public"]["Tables"]["users_profiles"]["Row"];
export type FoodItem = Database["public"]["Tables"]["food_items"]["Row"];
export type Meal = Database["public"]["Tables"]["meals"]["Row"];
export type MealIngredient = Database["public"]["Tables"]["meal_ingredients"]["Row"];
export type WorkoutSession = Database["public"]["Tables"]["workout_sessions"]["Row"];
export type PerformedExercise = Database["public"]["Tables"]["performed_exercises"]["Row"];
export type ExerciseSet = Database["public"]["Tables"]["exercise_sets"]["Row"];
export type WorkoutProgram = Database["public"]["Tables"]["workout_programs"]["Row"];
export type WorkoutDay = Database["public"]["Tables"]["workout_days"]["Row"];
export type PlannedExercise = Database["public"]["Tables"]["planned_exercises"]["Row"];
export type DailySummary = Database["public"]["Tables"]["daily_summaries"]["Row"];

export interface OnboardingFormValues {
  sex: Sex;
  age: number;
  height: number;
  weight: number;
  trainingFrequency: number;
  averageSteps: number;
  averageSleepHours: number;
  goalType: GoalType;
  goalDurationWeeks: number;
}

export interface MacroResult {
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealWithIngredients extends Meal {
  ingredients: MealIngredient[];
}

export interface SessionWithExercises extends WorkoutSession {
  exercises: (PerformedExercise & { sets: ExerciseSet[] })[];
}

export interface CartItem {
  id: string;
  name: string;
  foodItemId: string | null;
  grams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
