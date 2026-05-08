import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { upsertUserProfile } from "@/features/onboarding/services/onboardingService";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

export default function EstimationScreen() {
  const router = useRouter();
  const auth = useAuthStore();
  const store = useOnboardingStore();
  const plan = store.calculatePlan();

  const finish = async () => {
    if (!auth.userId) return;
    await upsertUserProfile({
      user_id: auth.userId,
      height: store.height,
      weight: store.weight,
      age: store.age,
      sex: store.sex,
      experience_level: store.experienceLevel,
      goal_type: store.goalType,
      goal_duration_weeks: store.goalDurationWeeks,
      training_frequency: store.trainingFrequency,
      average_steps: store.averageSteps,
      average_sleep_hours: store.averageSleepHours,
      current_daily_calories: store.currentDailyCalories,
      target_daily_calories: Math.round(plan.targetCalories),
      target_protein: Math.round(plan.protein),
      target_carbs: Math.round(plan.carbs),
      target_fats: Math.round(plan.fats),
    });
    await auth.refreshProfileState();
    router.replace("/(tabs)/dashboard");
  };

  return (
    <ScreenContainer>
      <View className="gap-4">
        <ProgressBar value={100} />
        <Text className="text-xl font-bold text-text">Etape 4/4 - Estimation</Text>
        <Card>
          <Text className="text-text">BMR: {Math.round(plan.bmr)}</Text>
          <Text className="text-text">TDEE: {Math.round(plan.tdee)}</Text>
          <Text className="text-text">Calories: {Math.round(plan.targetCalories)}</Text>
          <Text className="text-text">Proteines: {Math.round(plan.protein)}g</Text>
          <Text className="text-text">Glucides: {Math.round(plan.carbs)}g</Text>
          <Text className="text-text">Lipides: {Math.round(plan.fats)}g</Text>
        </Card>
        <Button label="Commencer" onPress={() => void finish()} />
      </View>
    </ScreenContainer>
  );
}
