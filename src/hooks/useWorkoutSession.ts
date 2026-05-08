"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";
import { getRecentSessions } from "@/services/supabase/queries/workouts";

export function useWorkoutSession() {
  return useQuery({
    queryKey: ["recent-sessions"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];
      return getRecentSessions(supabase, user.id, 10);
    },
  });
}
