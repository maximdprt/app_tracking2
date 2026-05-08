import { create } from "zustand";

interface OnboardingStateV1 {
  height: number;
  weight: number;
  goal: string;
  setGoal: (goal: string) => void;
}

export const useOnboardingStoreV1 = create<OnboardingStateV1>((set) => ({
  height: 175,
  weight: 75,
  goal: "muscle_gain",
  setGoal: (goal) => set({ goal }),
}));
