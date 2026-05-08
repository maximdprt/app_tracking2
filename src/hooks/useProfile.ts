"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";
import { getProfile } from "@/services/supabase/queries/profile";
import { PROFILE_STALE_TIME_MS } from "@/constants/nutrition";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    staleTime: PROFILE_STALE_TIME_MS,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      return getProfile(supabase, user.id);
    },
  });
}
