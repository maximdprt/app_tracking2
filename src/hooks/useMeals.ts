"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";
import { getMealsByDate } from "@/services/supabase/queries/meals";
import { useDateStore } from "@/stores/useDateStore";
import { useUser } from "@/hooks/useUser";

export function useMeals() {
  const { data: user } = useUser();
  const selectedDate = useDateStore((s) => s.selectedDate);

  return useQuery({
    queryKey: ["meals", user?.id ?? null, selectedDate],
    enabled: Boolean(user?.id),
    staleTime: 30_000,
    queryFn: async () => {
      if (!user?.id) return { meals: [] };
      const supabase = createClient();
      const meals = await getMealsByDate(supabase, user.id, selectedDate);
      return { meals };
    },
  });
}
