import { Pressable, Text, View } from "react-native";
import type { FoodItem } from "@/src/types/food";

interface FoodSearchItemProps {
  item: FoodItem;
  onPress: (item: FoodItem) => void;
}

export function FoodSearchItem({ item, onPress }: FoodSearchItemProps) {
  return (
    <Pressable onPress={() => onPress(item)} className="rounded-xl border border-border bg-surface p-3">
      <Text className="text-base font-semibold text-text">{item.nom}</Text>
      <View className="mt-1 flex-row gap-3">
        <Text className="text-xs text-textSecondary">{item.calories_100g} kcal</Text>
        <Text className="text-xs text-textSecondary">P {item.proteines_100g}</Text>
        <Text className="text-xs text-textSecondary">G {item.glucides_100g}</Text>
        <Text className="text-xs text-textSecondary">L {item.lipides_100g}</Text>
      </View>
    </Pressable>
  );
}
