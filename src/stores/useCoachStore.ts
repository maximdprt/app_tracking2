import { create } from "zustand";

export type CoachMessage = { id: string; role: "user" | "assistant"; content: string };

type CoachState = {
  messages: CoachMessage[];
  addMessage: (message: CoachMessage) => void;
  clear: () => void;
};

export const useCoachStore = create<CoachState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clear: () => set({ messages: [] }),
}));
