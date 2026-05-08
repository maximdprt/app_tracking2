import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fetchWeeklyWorkouts } from "@/features/sport/services/sportService";
import { requestMistralSummary } from "@/lib/mistral";
import { useAuthStore } from "@/stores/authStore";

export default function SportProgressScreen() {
  const { userId } = useAuthStore();
  const [summary, setSummary] = useState("");
  const [points, setPoints] = useState([{ value: 0 }, { value: 0 }]);

  useEffect(() => {
    const run = async () => {
      if (!userId) return;
      const data = await fetchWeeklyWorkouts(userId);
      setPoints(data.slice(0, 7).map((_, i) => ({ value: (i + 1) * 10 })));
    };
    void run();
  }, [userId]);

  return (
    <ScreenContainer>
      <View className="gap-4">
        <Text className="text-2xl font-bold text-text">Progression</Text>
        <LineChart data={points} color="#00E676" thickness={2} hideDataPoints />
        <Button label="Resume IA hebdo" onPress={async () => setSummary(await requestMistralSummary({ type: "sport_weekly", context: { points } }))} />
        {summary ? <Text className="text-text">{summary}</Text> : null}
      </View>
    </ScreenContainer>
  );
}
