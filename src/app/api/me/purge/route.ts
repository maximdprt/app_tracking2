import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { purgeUserAppData } from "@/lib/gdpr/purge-user-app-data";

/** POST — supprime toutes les données applicatives (RLS). Le compte Auth reste. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await purgeUserAppData(supabase, user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur purge";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
