import { create } from "zustand";
import { signIn, signOut } from "@/src/services/auth.service";

interface AuthState {
  userId: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStoreV1 = create<AuthState>((set) => ({
  userId: null,
  loading: false,
  login: async (email, password) => {
    set({ loading: true });
    try {
      await signIn(email, password);
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    await signOut();
    set({ userId: null });
  },
}));
