import type { MealType } from "@/types/domain";

export const MEAL_TYPES: { id: MealType; label: string; icon: string }[] = [
  { id: "breakfast", label: "Petit-déjeuner", icon: "☕" },
  { id: "lunch", label: "Déjeuner", icon: "🥗" },
  { id: "dinner", label: "Dîner", icon: "🍽️" },
  { id: "snack", label: "Collation", icon: "🍎" },
];

export function getMealTypeLabel(type: MealType): string {
  return MEAL_TYPES.find((m) => m.id === type)?.label ?? type;
}
