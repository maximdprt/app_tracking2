import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { generateSummary } from "@/services/ai/mistral";
import { upsertDailySummary } from "@/services/supabase/queries/summaries";
import { getProfile } from "@/services/supabase/queries/profile";
import { todayISO } from "@/utils/dates";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const date = todayISO();
    const profile = await getProfile(supabase, user.id);

    const [{ data: meals }, { data: sessions }] = await Promise.all([
      supabase
        .from("meals")
        .select("meal_type, total_calories, total_protein, total_carbs, total_fats")
        .eq("user_id", user.id)
        .eq("meal_date", date),
      supabase
        .from("workout_sessions")
        .select("workout_name, duration_minutes, status")
        .eq("user_id", user.id)
        .eq("session_date", date),
    ]);

    const totals = (meals ?? []).reduce(
      (acc, m) => ({
        calories: acc.calories + m.total_calories,
        protein: acc.protein + m.total_protein,
        carbs: acc.carbs + m.total_carbs,
        fats: acc.fats + m.total_fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    const context = {
      date,
      goal: profile?.goal_type ?? null,
      targets: {
        calories: profile?.target_daily_calories ?? null,
        protein: profile?.target_protein ?? null,
        carbs: profile?.target_carbs ?? null,
        fats: profile?.target_fats ?? null,
      },
      consumed: totals,
      meals_count: meals?.length ?? 0,
      session: sessions?.[0]
        ? {
            name: sessions[0].workout_name,
            duration: sessions[0].duration_minutes,
            status: sessions[0].status,
          }
        : null,
    };

    const summary = await generateSummary(context);
    await upsertDailySummary(supabase, user.id, date, summary);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[api/ai/summary]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
