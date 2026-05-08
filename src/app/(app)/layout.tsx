import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createServerClient } from "@/services/supabase/server";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
