import { create } from "zustand";
import type { ChatMessage } from "@/types/domain";

interface CoachState {
  /** Fil « Principal » Lift (persisté Postgres). */
  threadId: string | null;
  messages: ChatMessage[];
  setThreadId: (id: string | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (msg: ChatMessage) => void;
  appendToLastAssistant: (chunk: string) => void;
  /** Supprime la dernière bulle assistant si elle est encore vide (erreur réseau / arrêt). */
  trimTrailingEmptyAssistant: () => void;
  resetLocal: () => void;
}

export const useCoachStore = create<CoachState>((set) => ({
  threadId: null,
  messages: [],
  setThreadId: (threadId) => set({ threadId }),
  setMessages: (messages) => set({ messages }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  appendToLastAssistant: (chunk) =>
    set((s) => {
      const last = s.messages[s.messages.length - 1];
      if (!last || last.role !== "assistant") {
        return {
          messages: [
            ...s.messages,
            { id: crypto.randomUUID(), role: "assistant", content: chunk },
          ],
        };
      }
      const updated = [
        ...s.messages.slice(0, -1),
        { ...last, content: last.content + chunk },
      ];
      return { messages: updated };
    }),
  trimTrailingEmptyAssistant: () =>
    set((s) => {
      const last = s.messages[s.messages.length - 1];
      if (last?.role === "assistant" && last.content.trim() === "") {
        return { messages: s.messages.slice(0, -1) };
      }
      return s;
    }),
  resetLocal: () => set({ messages: [] }),
}));
