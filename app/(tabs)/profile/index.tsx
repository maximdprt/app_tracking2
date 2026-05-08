import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fetchProfile } from "@/features/auth/services/authService";
import { useAuthStore } from "@/stores/authStore";

export default function ProfileScreen() {
  const { userId, signOut } = useAuthStore();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      const data = await fetchProfile(userId);
      setProfile((data ?? null) as Record<string, unknown> | null);
    };
    void run();
  }, [userId]);

  return (
    <ScreenContainer>
      <View className="gap-4">
        <Text className="text-2xl font-bold text-text">Profil</Text>
        <Card>
          <Text className="text-text">Objectif: {String(profile?.goal_type ?? "-")}</Text>
          <Text className="text-text">Calories cible: {String(profile?.target_daily_calories ?? "-")}</Text>
        </Card>
        <Button label="Se deconnecter" variant="danger" onPress={() => void signOut()} />
      </View>
    </ScreenContainer>
  );
}
