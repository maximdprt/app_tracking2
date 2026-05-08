import { View } from "react-native";

interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <View className="h-3 w-full rounded-full bg-surfaceElevated">
      <View className="h-3 rounded-full bg-primary" style={{ width: `${normalized}%` }} />
    </View>
  );
}
