import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fetchProfile } from "@/features/auth/services/authService";
import { updateProfile } from "@/features/profile/services/profileService";
import { useAuthStore } from "@/stores/authStore";

export default function SettingsScreen() {
  const { userId } = useAuthStore();
  const [calories, setCalories] = useState("2000");

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      const profile = await fetchProfile(userId);
      setCalories(String(profile?.target_daily_calories ?? 2000));
    };
    void run();
  }, [userId]);

  const save = async () => {
    if (!userId) return;
    await updateProfile(userId, { target_daily_calories: Number(calories) });
  };

  return (
    <ScreenContainer>
      <View className="gap-4">
        <Text className="text-2xl font-bold text-text">Parametres</Text>
        <Input label="Calories cible" value={calories} onChangeText={setCalories} keyboardType="numeric" />
        <Button label="Enregistrer" onPress={() => void save()} />
      </View>
    </ScreenContainer>
  );
}
