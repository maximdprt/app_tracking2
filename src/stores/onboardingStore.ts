import { create } from "zustand";
import { calculateActivityLevel, calculateBMR, calculateMacros, calculateTargetCalories, calculateTDEE } from "@/utils/calculations";
import type { GoalType, Sex } from "@/types";

interface OnboardingState {
  height: number;
  weight: number;
  age: number;
  sex: Sex;
  experienceLevel: string;
  goalType: GoalType;
  goalDurationWeeks: number;
  trainingFrequency: number;
  averageSteps: number;
  averageSleepHours: number;
  currentDailyCalories: number;
  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  calculatePlan: () => { bmr: number; tdee: number; targetCalories: number; protein: number; carbs: number; fats: number };
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  height: 175,
  weight: 75,
  age: 28,
  sex: "male",
  experienceLevel: "beginner",
  goalType: "muscle_gain",
  goalDurationWeeks: 12,
  trainingFrequency: 3,
  averageSteps: 7000,
  averageSleepHours: 7,
  currentDailyCalories: 2200,

  setField: (key, value) => set(() => ({ [key]: value }) as Partial<OnboardingState>),

  calculatePlan: () => {
    const state = get();
    const bmr = calculateBMR(state.weight, state.height, state.age, state.sex);
    const activity = calculateActivityLevel(state.trainingFrequency, state.averageSteps);
    const tdee = calculateTDEE(bmr, activity);
    const targetCalories = calculateTargetCalories(tdee, state.goalType);
    const macros = calculateMacros(targetCalories, state.weight, state.goalType);

    return { bmr, tdee, targetCalories, ...macros };
  },
}));
