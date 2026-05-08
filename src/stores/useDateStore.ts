import { create } from "zustand";
import { toISODate } from "@/utils/dates";

type DateState = {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  setToday: () => void;
};

export const useDateStore = create<DateState>((set) => ({
  selectedDate: toISODate(new Date()),
  setSelectedDate: (value) => set({ selectedDate: value }),
  setToday: () => set({ selectedDate: toISODate(new Date()) }),
}));
