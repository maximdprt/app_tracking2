import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export default function IndexPage() {
  const { isAuthenticated, hasProfile, isHydrated, init } = useAuthStore();

  useEffect(() => {
    void init();
  }, [init]);

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!hasProfile) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}
