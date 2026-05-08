import type { MacroResult } from "@/src/utils/macroCalculator";

export function sumMacros(values: MacroResult[]): MacroResult {
  return values.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats,
      sugar: acc.sugar + item.sugar,
      fiber: acc.fiber + item.fiber,
      salt: acc.salt + item.salt,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, sugar: 0, fiber: 0, salt: 0 },
  );
}
