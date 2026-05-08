import { Text, View } from "react-native";
import type { MacroResult } from "@/src/utils/macroCalculator";
import { MacroCard } from "@/src/components/food/MacroCard";

interface MealSummaryProps {
  macros: MacroResult;
}

export function MealSummary({ macros }: MealSummaryProps) {
  return (
    <View className="gap-3">
      <MacroCard label="Calories" value={macros.calories} unit="kcal" />
      <View className="flex-row gap-2">
        <MacroCard label="Proteines" value={macros.protein} />
        <MacroCard label="Glucides" value={macros.carbs} />
        <MacroCard label="Lipides" value={macros.fats} />
      </View>
      <Text className="text-xs text-textSecondary">Sucres {macros.sugar.toFixed(1)} g | Fibres {macros.fiber.toFixed(1)} g | Sel {macros.salt.toFixed(2)} g</Text>
    </View>
  );
}
