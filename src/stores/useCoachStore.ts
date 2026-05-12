import { create } from "zustand";
import type { ChatMessage } from "@/types/domain";

interface CoachState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  appendToLastAssistant: (chunk: string) => void;
  clear: () => void;
}

export const useCoachStore = create<CoachState>((set) => ({
  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  appendToLastAssistant: (chunk) =>
    set((s) => {
      const last = s.messages[s.messages.length - 1];
      if (!last || last.role !== "assistant") {
        return {
          messages: [...s.messages, { id: crypto.randomUUID(), role: "assistant", content: chunk }],
        };
      }
      const updated = [...s.messages.slice(0, -1), { ...last, content: last.content + chunk }];
      return { messages: updated };
    }),
  clear: () => set({ messages: [] }),
}));
