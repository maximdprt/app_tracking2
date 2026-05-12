import { redirect } from "next/navigation";
import { createClient } from "@/services/supabase/server";
import { ROUTES } from "@/constants/routes";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(ROUTES.login);
  redirect(ROUTES.dashboard);
}
