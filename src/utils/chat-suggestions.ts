"use client";

import { useSleep, useSteps, useWeightHistoryLogs } from "@/hooks/useDaily";
import { useToday } from "@/hooks/useToday";
import { todayISO } from "@/utils/dates";

export function useChatSuggestions(): string[] {
  const { totals, targets, profile, sessions } = useToday();
  const today = todayISO();
  const sleepQuery = useSleep(today);
  const stepsQuery = useSteps(today);
  const weightHistoryQuery = useWeightHistoryLogs(7);

  const suggestions: string[] = [];

  // No meals today
  if (totals.calories === 0) {
    suggestions.push("Que devrais-je manger ce midi ?");
  }

  // No workout today but sessions exist in last 7 days
  const hasSessionToday = sessions.some((s) => s.session_date === today);
  if (!hasSessionToday && sessions.length > 0) {
    suggestions.push("Conseille-moi pour ma séance d'aujourd'hui");
  }

  // Big calorie gap
  const calsGap = Math.abs(targets.calories - totals.calories);
  if (calsGap > 500 && totals.calories > 0) {
    suggestions.push("Pourquoi je n'atteins pas mes objectifs caloriques ?");
  }

  // Stagnant weight for cut/bulk goal
  const goalType = profile?.goal_type;
  if ((goalType === "weight_loss" || goalType === "muscle_gain") && weightHistoryQuery.data) {
    const weights = weightHistoryQuery.data;
    if (weights.length >= 3) {
      const firstEntry = weights[0];
      const lastEntry = weights[weights.length - 1];
      const first = firstEntry?.weight ?? 0;
      const last = lastEntry?.weight ?? 0;
      const stagnant = Math.abs(last - first) < 0.5;
      if (stagnant) {
        suggestions.push("Pourquoi mon poids stagne depuis une semaine ?");
      }
    }
  }

  // Sleep not logged
  if (!sleepQuery.data) {
    suggestions.push("Combien d'heures de sommeil me faut-il pour progresser ?");
  }

  // Steps not logged
  if (!stepsQuery.data) {
    suggestions.push("Quel impact l'activité quotidienne a-t-elle sur mes objectifs ?");
  }

  return suggestions.slice(0, 4);
}
