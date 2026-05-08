import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function PhysicalInfoScreen() {
  const router = useRouter();
  const store = useOnboardingStore();

  return (
    <ScreenContainer>
      <View className="gap-4">
        <ProgressBar value={25} />
        <Text className="text-xl font-bold text-text">Etape 1/4 - Infos physiques</Text>
        <Input label="Taille (cm)" value={String(store.height)} onChangeText={(v) => store.setField("height", Number(v) || 0)} keyboardType="numeric" />
        <Input label="Poids (kg)" value={String(store.weight)} onChangeText={(v) => store.setField("weight", Number(v) || 0)} keyboardType="numeric" />
        <Input label="Age" value={String(store.age)} onChangeText={(v) => store.setField("age", Number(v) || 0)} keyboardType="numeric" />
        <Button label="Suivant" onPress={() => router.push("/(onboarding)/goals")} />
      </View>
    </ScreenContainer>
  );
}
