import { useMemo } from "react";
import { useFoodStore } from "@/src/stores/food.store";

export function useTodayNutrition() {
  const { macros } = useFoodStore();

  return useMemo(() => macros, [macros]);
}
