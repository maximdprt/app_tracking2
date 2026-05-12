import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/services/supabase/server";
import { getProfile } from "@/services/supabase/queries/profile";
import { ROUTES } from "@/constants/routes";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(ROUTES.login);

  const profile = await getProfile(supabase, user.id);
  if (!profile || profile.target_daily_calories === null) {
    redirect(ROUTES.onboarding);
  }

  return <AppShell email={user.email}>{children}</AppShell>;
}
