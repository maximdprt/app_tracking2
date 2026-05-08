import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/services/supabase/server";
import { callMistralProxy } from "@/services/ai/mistral";
export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const today = new Date().toISOString().slice(0, 10);
  const { data: meals } = await supabase
    .from("meals")
    .select("total_calories,total_protein,total_carbs,total_fats")
    .eq("user_id", user.id)
    .eq("meal_date", today);
  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("workout_name,duration_minutes,status")
    .eq("user_id", user.id)
    .eq("session_date", today);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const result = await callMistralProxy({
    jwt: session?.access_token ?? "",
    type: "global",
    context: { meals: meals ?? [], sessions: sessions ?? [] },
  });
  const summaryText = typeof result?.summary === "string" ? result.summary : "Resume genere.";
  await supabase
    .from("daily_summaries")
    .upsert(
      {
        user_id: user.id,
        summary_date: today,
        global_summary: summaryText,
        sport_summary: summaryText,
        food_summary: summaryText,
      },
      { onConflict: "user_id,summary_date" },
    );
  return NextResponse.json({ summary: summaryText });
}
