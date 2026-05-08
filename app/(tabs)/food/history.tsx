import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function FoodHistoryScreen() {
  return (
    <ScreenContainer>
      <View className="gap-4">
        <Text className="text-2xl font-bold text-text">Historique</Text>
        <Card><Text className="text-text">Stats hebdo et jours respectes (V1)</Text></Card>
      </View>
    </ScreenContainer>
  );
}
