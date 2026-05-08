import { useAuthStoreV1 } from "@/src/stores/auth.store";

export function useAuth() {
  return useAuthStoreV1();
}
