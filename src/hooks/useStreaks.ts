import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";
import { useUser } from "@/hooks/useUser";

export interface UserStreaks {
  food_log_current: number;
  food_log_longest: number;
  workout_current: number;
  workout_longest: number;
  last_food_log_date: string | null;
  last_workout_date: string | null;
}

const EMPTY_STREAKS: UserStreaks = {
  food_log_current: 0,
  food_log_longest: 0,
  workout_current: 0,
  workout_longest: 0,
  last_food_log_date: null,
  last_workout_date: null,
};

export function useStreaks() {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ["user-streaks", user?.id],
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<UserStreaks> => {
      const supabase = createClient();
      // user_streaks table added in migration 0008 — bypass generated types until applied
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("user_streaks")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) {
        // Table pas encore migrée → retour silencieux
        if (error.code === "42P01" || /does not exist/i.test(error.message)) {
          return EMPTY_STREAKS;
        }
        throw error;
      }

      return (data as UserStreaks | null) ?? EMPTY_STREAKS;
    },
  });
}
