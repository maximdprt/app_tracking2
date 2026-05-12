"use client";

import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, endOfWeek, format, min, startOfWeek, subWeeks } from "date-fns";
import { createClient } from "@/services/supabase/client";
import { useUser } from "@/hooks/useUser";
import { getMealTotalsInDateRange } from "@/services/supabase/queries/meals";

/** Moyennes journalières (kcal et macros) cette semaine (lun → auj.) vs semaine précédente (7 jours). */
export function useWeeklyNutritionCompare() {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ["weekly-nutrition-compare", user?.id],
    enabled: Boolean(user?.id),
    staleTime: 120_000,
    queryFn: async () => {
      if (!user?.id) return null;
      const now = new Date();
      const cwStart = startOfWeek(now, { weekStartsOn: 1 });
      const lwStart = subWeeks(cwStart, 1);
      const lwEnd = endOfWeek(lwStart, { weekStartsOn: 1 });
      const cwEnd = min([now, endOfWeek(cwStart, { weekStartsOn: 1 })]);

      const startThis = format(cwStart, "yyyy-MM-dd");
      const endThis = format(cwEnd, "yyyy-MM-dd");
      const startPrev = format(lwStart, "yyyy-MM-dd");
      const endPrev = format(lwEnd, "yyyy-MM-dd");

      const sb = createClient();
      const [cur, prev] = await Promise.all([
        getMealTotalsInDateRange(sb, user.id, startThis, endThis),
        getMealTotalsInDateRange(sb, user.id, startPrev, endPrev),
      ]);

      const daysThis = Math.max(1, differenceInCalendarDays(cwEnd, cwStart) + 1);

      return {
        thisWeekAvg: {
          calories: cur.calories / daysThis,
          protein: cur.protein / daysThis,
          carbs: cur.carbs / daysThis,
          fats: cur.fats / daysThis,
        },
        prevWeekAvg: {
          calories: prev.calories / 7,
          protein: prev.protein / 7,
          carbs: prev.carbs / 7,
          fats: prev.fats / 7,
        },
      };
    },
  });
}
