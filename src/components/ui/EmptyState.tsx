import { Text, View } from "react-native";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="rounded-xl border border-border bg-surface p-4">
      <Text className="text-base font-semibold text-text">{title}</Text>
      {description ? <Text className="mt-1 text-sm text-textSecondary">{description}</Text> : null}
    </View>
  );
}
