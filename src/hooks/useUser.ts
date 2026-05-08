"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/services/supabase/client";

export function useUser() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return { email };
}
