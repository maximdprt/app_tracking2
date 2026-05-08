"use client";

import { useQuery } from "@tanstack/react-query";
import { TODAY_STALE_TIME_MS } from "@/constants/nutrition";
import { createClient } from "@/services/supabase/client";
import { getMealsByDate } from "@/services/supabase/queries/meals";
import { useDateStore } from "@/stores/useDateStore";

export function useMeals() {
  const selectedDate = useDateStore((state) => state.selectedDate);

  return useQuery({
    queryKey: ["meals", selectedDate],
    staleTime: TODAY_STALE_TIME_MS,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { meals: [], ingredients: [] };
      return getMealsByDate(supabase, user.id, selectedDate);
    },
  });
}
