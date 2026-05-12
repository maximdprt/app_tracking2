"use client";

import { useMemo } from "react";
import { useMeals } from "@/hooks/useMeals";
import { useProfile } from "@/hooks/useProfile";
import { useWorkoutSessions } from "@/hooks/useWorkoutSession";

export function useToday() {
  const profileQuery = useProfile();
  const mealsQuery = useMeals();
  const sessionsQuery = useWorkoutSessions();

  const meals = mealsQuery.data?.meals ?? [];
  const sessions = sessionsQuery.data ?? [];
  const profile = profileQuery.data;

  const totals = useMemo(
    () =>
      meals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.total_calories,
          protein: acc.protein + m.total_protein,
          carbs: acc.carbs + m.total_carbs,
          fats: acc.fats + m.total_fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
      ),
    [meals],
  );

  return {
    profile,
    meals,
    sessions,
    totals,
    targets: {
      calories: profile?.target_daily_calories ?? 2500,
      protein: profile?.target_protein ?? 150,
      carbs: profile?.target_carbs ?? 280,
      fats: profile?.target_fats ?? 70,
    },
    isLoading: profileQuery.isLoading || mealsQuery.isLoading || sessionsQuery.isLoading,
  };
}
