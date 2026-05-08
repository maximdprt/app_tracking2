import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function GoalsScreen() {
  const router = useRouter();
  const store = useOnboardingStore();

  return (
    <ScreenContainer>
      <View className="gap-4">
        <ProgressBar value={50} />
        <Text className="text-xl font-bold text-text">Etape 2/4 - Objectifs</Text>
        <Input label="Objectif (muscle_gain, weight_loss...)" value={store.goalType} onChangeText={(v) => store.setField("goalType", v as never)} />
        <Input label="Duree (semaines)" value={String(store.goalDurationWeeks)} onChangeText={(v) => store.setField("goalDurationWeeks", Number(v) || 0)} keyboardType="numeric" />
        <Button label="Suivant" onPress={() => router.push("/(onboarding)/habits")} />
      </View>
    </ScreenContainer>
  );
}
