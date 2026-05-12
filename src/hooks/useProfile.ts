"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";
import { getProfile } from "@/services/supabase/queries/profile";
import { useUser } from "@/hooks/useUser";

export function useProfile() {
  const { data: user } = useUser();

  return useQuery({
    queryKey: ["profile", user?.id ?? null],
    enabled: Boolean(user?.id),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!user?.id) return null;
      const supabase = createClient();
      return getProfile(supabase, user.id);
    },
  });
}
