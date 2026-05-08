import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fetchWorkoutSessions } from "@/features/sport/services/sportService";
import { useAuthStore } from "@/stores/authStore";

export default function SportScreen() {
  const { userId } = useAuthStore();
  const [sessions, setSessions] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      const today = new Date().toISOString().slice(0, 10);
      const data = await fetchWorkoutSessions(userId, today);
      setSessions(data as Array<Record<string, unknown>>);
    };
    void run();
  }, [userId]);

  return (
    <ScreenContainer>
      <View className="gap-4">
        <Text className="text-2xl font-bold text-text">Sport</Text>
        <Card><Text className="text-text">Seances du jour: {sessions.length}</Text></Card>
        <Button label="Logger ma seance" onPress={() => {}} />
      </View>
    </ScreenContainer>
  );
}
