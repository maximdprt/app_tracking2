import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createClient } from "@/services/supabase/server";
import { getProfile } from "@/services/supabase/queries/profile";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile(supabase, user.id);
  if (!profile || profile.target_daily_calories === null) {
    redirect("/onboarding");
  }

  return (
    <AppShell title="Dashboard" email={user.email}>
      {children}
    </AppShell>
  );
}
