import { create } from "zustand";
import { todayISO } from "@/utils/dates";

interface DateState {
  selectedDate: string;
  setSelectedDate: (iso: string) => void;
  setToday: () => void;
}

export const useDateStore = create<DateState>((set) => ({
  selectedDate: todayISO(),
  setSelectedDate: (iso) => set({ selectedDate: iso }),
  setToday: () => set({ selectedDate: todayISO() }),
}));
