import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function HabitsScreen() {
  const router = useRouter();
  const store = useOnboardingStore();

  return (
    <ScreenContainer>
      <View className="gap-4">
        <ProgressBar value={75} />
        <Text className="text-xl font-bold text-text">Etape 3/4 - Habitudes</Text>
        <Input label="Entrainements / semaine" value={String(store.trainingFrequency)} onChangeText={(v) => store.setField("trainingFrequency", Number(v) || 0)} keyboardType="numeric" />
        <Input label="Pas / jour" value={String(store.averageSteps)} onChangeText={(v) => store.setField("averageSteps", Number(v) || 0)} keyboardType="numeric" />
        <Input label="Sommeil moyen (h)" value={String(store.averageSleepHours)} onChangeText={(v) => store.setField("averageSleepHours", Number(v) || 0)} keyboardType="numeric" />
        <Button label="Suivant" onPress={() => router.push("/(onboarding)/estimation")} />
      </View>
    </ScreenContainer>
  );
}
