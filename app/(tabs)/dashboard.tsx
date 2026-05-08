import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MacroRing } from "@/components/ui/MacroRing";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fetchDashboardData } from "@/features/dashboard/services/dashboardService";
import { requestMistralSummary } from "@/lib/mistral";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardScreen() {
  const { userId } = useAuthStore();
  const [summary, setSummary] = useState<string>("");
  const [calories, setCalories] = useState({ current: 0, target: 2000 });

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      const today = format(new Date(), "yyyy-MM-dd");
      const data = await fetchDashboardData(userId, today);
      const total = data.meals.reduce((acc, meal) => acc + Number(meal.total_calories ?? 0), 0);
      setCalories({ current: total, target: Number(data.profile?.target_daily_calories ?? 2000) });
    };
    void run();
  }, [userId]);

  const getAiSummary = async () => {
    const text = await requestMistralSummary({ type: "global", context: { calories } });
    setSummary(text);
  };

  return (
    <ScreenContainer>
      <View className="gap-4">
        <Text className="text-2xl font-bold text-text">Bonjour</Text>
        <Text className="text-textSecondary">{format(new Date(), "EEEE d MMMM", { locale: fr })}</Text>
        <Card><MacroRing label="Kcal" value={calories.current} target={calories.target} /></Card>
        <Button label="Resume IA" onPress={() => void getAiSummary()} />
        {summary ? <Card><Text className="text-text">{summary}</Text></Card> : null}
      </View>
    </ScreenContainer>
  );
}
