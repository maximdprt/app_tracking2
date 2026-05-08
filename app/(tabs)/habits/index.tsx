import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function HabitsScreen() {
  return (
    <ScreenContainer>
      <View className="gap-4">
        <Text className="text-2xl font-bold text-text">Habits</Text>
        <Card>
          <Text className="text-text">Bientot disponible : construis tes habitudes healthy.</Text>
          <Text className="text-textSecondary">A venir: sommeil, pas, hydratation, routine matinale.</Text>
        </Card>
      </View>
    </ScreenContainer>
  );
}
