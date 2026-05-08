import { Card } from "@/components/ui/card";
import { Topbar } from "@/components/layout/Topbar";
import { createServerClient } from "@/services/supabase/server";

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <Topbar title="Dashboard" />
      <Card>
        <p className="text-muted text-sm">Bienvenue sur Lift.</p>
        <h2 className="mt-2 text-2xl font-semibold">Bonjour {user?.email ?? "athlete"}.</h2>
      </Card>
    </div>
  );
}
