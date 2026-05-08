import { Text, View } from "react-native";

interface MacroCardProps {
  label: string;
  value: number;
  unit?: string;
}

export function MacroCard({ label, value, unit = "g" }: MacroCardProps) {
  return (
    <View className="min-h-11 flex-1 rounded-xl border border-border bg-surface p-3">
      <Text className="text-xs text-textSecondary">{label}</Text>
      <Text className="text-lg font-bold text-text">
        {value.toFixed(1)} {unit}
      </Text>
    </View>
  );
}
