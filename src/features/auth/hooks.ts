"use client";

import { createBrowserSupabaseClient } from "@/services/supabase/client";
import { AppError } from "@/types/domain";

const supabase = createBrowserSupabaseClient();

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new AppError("AUTH", error.message, error);
}

export async function signUp(email: string, password: string) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw new AppError("AUTH", error.message, error);
}
