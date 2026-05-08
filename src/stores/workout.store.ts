import { create } from "zustand";

interface WorkoutState {
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  activeSessionId: null,
  setActiveSessionId: (id) => set({ activeSessionId: id }),
}));
