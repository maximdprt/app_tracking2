import { Text, View } from "react-native";

interface ExerciseCardProps {
  name: string;
}

export function ExerciseCard({ name }: ExerciseCardProps) {
  return (
    <View className="rounded-xl border border-border bg-surface p-3">
      <Text className="text-text">{name}</Text>
    </View>
  );
}
