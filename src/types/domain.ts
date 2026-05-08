import { Tables } from "@/types/database";

export type Sex = "male" | "female";

export type GoalType =
  | "weight_loss"
  | "recomposition"
  | "maintenance"
  | "muscle_gain"
  | "performance";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "intense" | "very_intense";

export type UserProfile = Tables<"users_profiles">;

export type OnboardingFormValues = {
  sex: Sex;
  age: number;
  height: number;
  weight: number;
  trainingFrequency: number;
  averageSteps: number;
  averageSleepHours: number;
  goalType: GoalType;
  goalDurationWeeks: number;
};
