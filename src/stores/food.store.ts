import { create } from "zustand";
import type { FoodItem } from "@/src/types/food";
import { calculateMacrosFromFood, type MacroResult } from "@/src/utils/macroCalculator";

interface FoodState {
  selectedFood: FoodItem | null;
  grams: number;
  macros: MacroResult | null;
  setSelectedFood: (food: FoodItem | null) => void;
  setGrams: (grams: number) => void;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  selectedFood: null,
  grams: 100,
  macros: null,
  setSelectedFood: (food) => {
    const { grams } = get();
    set({ selectedFood: food, macros: food ? calculateMacrosFromFood(food, grams) : null });
  },
  setGrams: (grams) => {
    const { selectedFood } = get();
    set({ grams, macros: selectedFood ? calculateMacrosFromFood(selectedFood, grams) : null });
  },
}));
