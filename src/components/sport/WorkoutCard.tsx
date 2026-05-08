import { Text, View } from "react-native";

interface WorkoutCardProps {
  title: string;
}

export function WorkoutCard({ title }: WorkoutCardProps) {
  return (
    <View className="rounded-xl border border-border bg-surface p-3">
      <Text className="font-semibold text-text">{title}</Text>
    </View>
  );
}
