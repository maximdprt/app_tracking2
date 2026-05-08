import { ActivityIndicator, View } from "react-native";

export function Loading() {
  return (
    <View className="items-center justify-center py-6">
      <ActivityIndicator color="#00E676" />
    </View>
  );
}
