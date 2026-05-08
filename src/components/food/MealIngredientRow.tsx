import { Text, View } from "react-native";

interface MealIngredientRowProps {
  label: string;
  grams: number;
}

export function MealIngredientRow({ label, grams }: MealIngredientRowProps) {
  return (
    <View className="flex-row items-center justify-between rounded-xl border border-border bg-surface p-3">
      <Text className="text-text">{label}</Text>
      <Text className="text-textSecondary">{grams} g</Text>
    </View>
  );
}
