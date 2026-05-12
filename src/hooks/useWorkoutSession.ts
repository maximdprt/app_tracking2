"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";
import { getRecentSessions, getSessionWithExercises } from "@/services/supabase/queries/workouts";
import { useUser } from "@/hooks/useUser";

export function useWorkoutSessions(limit = 10) {
  const { data: user } = useUser();
  return useQuery({
    queryKey: ["workout-sessions", user?.id ?? null, limit],
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      return getRecentSessions(supabase, user.id, limit);
    },
  });
}

export function useWorkoutSession(sessionId: string | null) {
  const { data: user } = useUser();
  return useQuery({
    queryKey: ["workout-session", sessionId],
    enabled: Boolean(user?.id && sessionId),
    staleTime: 30_000,
    queryFn: async () => {
      if (!user?.id || !sessionId) return null;
      const supabase = createClient();
      return getSessionWithExercises(supabase, sessionId, user.id);
    },
  });
}
