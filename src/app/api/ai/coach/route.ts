import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { streamCoach, type MistralMessage } from "@/services/ai/mistral";
import { getRecentSummaries } from "@/services/supabase/queries/summaries";
import { getProfile } from "@/services/supabase/queries/profile";
import { getMealsByDate } from "@/services/supabase/queries/meals";
import { getRecentSessions } from "@/services/supabase/queries/workouts";
import {
  getSleepByDate,
  getStepsByDate,
  getWeightHistoryReal,
} from "@/services/supabase/queries/daily";
import { todayISO } from "@/utils/dates";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as { messages: MistralMessage[] };
    if (!Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const today = todayISO();

    const [profile, summaries, todayMeals, todaySleep, todaySteps, recentSessions, recentWeight] =
      await Promise.all([
        getProfile(supabase, user.id),
        getRecentSummaries(supabase, user.id, 7),
        getMealsByDate(supabase, user.id, today),
        getSleepByDate(supabase, user.id, today),
        getStepsByDate(supabase, user.id, today),
        getRecentSessions(supabase, user.id, 5),
        getWeightHistoryReal(supabase, user.id, 30),
      ]);

    const totals = todayMeals.reduce(
      (acc, m) => ({
        calories: acc.calories + m.total_calories,
        protein: acc.protein + m.total_protein,
        carbs: acc.carbs + m.total_carbs,
        fats: acc.fats + m.total_fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    const context = {
      date: today,
      profile: {
        age: profile?.age,
        sex: profile?.sex,
        height: profile?.height,
        weight: profile?.weight,
        goal: profile?.goal_type,
        goal_duration_weeks: profile?.goal_duration_weeks,
      },
      targets: {
        calories: profile?.target_daily_calories,
        protein: profile?.target_protein,
        carbs: profile?.target_carbs,
        fats: profile?.target_fats,
      },
      today: {
        consumed: totals,
        meals_count: todayMeals.length,
        sleep_hours: todaySleep?.hours ?? null,
        sleep_quality: todaySleep?.quality ?? null,
        steps: todaySteps?.steps ?? null,
      },
      recent_sessions: recentSessions.map((s) => ({
        date: s.session_date,
        name: s.workout_name,
        status: s.status,
        duration: s.duration_minutes,
      })),
      weight_history: recentWeight.map((w) => ({ date: w.log_date, weight: w.weight })),
      recent_summaries: summaries.map((s) => ({
        date: s.summary_date,
        summary: s.global_summary,
      })),
    };

    const stream = await streamCoach(body.messages, context);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    console.error("[api/ai/coach]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
