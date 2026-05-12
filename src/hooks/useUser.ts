"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";

export function useUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 5 * 60 * 1000,
  });
}
