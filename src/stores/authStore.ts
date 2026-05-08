import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

const SESSION_KEY = "lift_session";

interface AuthStore {
  userId: string | null;
  isAuthenticated: boolean;
  hasProfile: boolean;
  isHydrated: boolean;
  loading: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfileState: () => Promise<void>;
}

async function persistSession(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(data.session));
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  userId: null,
  isAuthenticated: false,
  hasProfile: false,
  isHydrated: false,
  loading: false,

  init: async () => {
    set({ loading: true });
    try {
      const cached = await SecureStore.getItemAsync(SESSION_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { access_token: string; refresh_token: string };
        await supabase.auth.setSession({ access_token: parsed.access_token, refresh_token: parsed.refresh_token });
      }

      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id ?? null;
      set({ userId, isAuthenticated: Boolean(userId) });

      if (userId) {
        await get().refreshProfileState();
      }
    } finally {
      set({ isHydrated: true, loading: false });
    }
  },

  refreshProfileState: async () => {
    const { userId } = get();
    if (!userId) return;
    const { data } = await supabase.from("users_profiles").select("id").eq("user_id", userId).maybeSingle();
    set({ hasProfile: Boolean(data?.id) });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await persistSession();
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id ?? null;
      set({ userId, isAuthenticated: Boolean(userId) });
      await get().refreshProfileState();
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(SESSION_KEY);
    set({ userId: null, isAuthenticated: false, hasProfile: false });
  },
}));
