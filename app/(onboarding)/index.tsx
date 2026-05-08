import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

export default function OnboardingIndex() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View className="flex-1 justify-center gap-6">
        <Text className="text-3xl font-bold text-text">Onboarding Lift</Text>
        <Text className="text-textSecondary">4 etapes pour personnaliser ton plan.</Text>
        <Button label="Commencer" onPress={() => router.push("/(onboarding)/physical-info")} />
      </View>
    </ScreenContainer>
  );
}
