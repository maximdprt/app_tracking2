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
import type { DailySummary } from "@/types/domain";
import type { MealWithIngredients } from "@/types/domain";
import type { Profile } from "@/types/domain";
import type { WorkoutSession } from "@/types/domain";
import type { SleepLog, StepsLog, WeightLog } from "@/services/supabase/queries/daily";

function sanitizeCoachMessages(raw: unknown): MistralMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: MistralMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") continue;
    const role = (m as { role?: string }).role;
    const content = (m as { content?: string }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    out.push({ role, content });
  }
  return out;
}

function take<T>(
  results: PromiseSettledResult<unknown>[],
  index: number,
  fallback: T,
  label: string,
): T {
  const r = results[index];
  if (!r) return fallback;
  if (r.status === "fulfilled") return r.value as T;
  console.warn(`[api/ai/coach] context "${label}" ignoré:`, r.reason);
  return fallback;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as { messages?: unknown };
    const messages = sanitizeCoachMessages(body.messages);
    if (messages.length === 0) {
      return NextResponse.json({ error: "Aucun message valide" }, { status: 400 });
    }

    const today = todayISO();

    /** Tables optionnelles (ex. migration 0005 non appliquée) : on ne casse pas toute la route. */
    const settled = await Promise.allSettled([
      getProfile(supabase, user.id),
      getRecentSummaries(supabase, user.id, 7),
      getMealsByDate(supabase, user.id, today),
      getSleepByDate(supabase, user.id, today),
      getStepsByDate(supabase, user.id, today),
      getRecentSessions(supabase, user.id, 5),
      getWeightHistoryReal(supabase, user.id, 30),
    ]);

    const profile = take<Profile | null>(settled, 0, null, "profile");
    const summaries = take<DailySummary[]>(settled, 1, [], "summaries");
    const todayMeals = take<MealWithIngredients[]>(settled, 2, [], "meals");
    const todaySleep = take<SleepLog | null>(settled, 3, null, "sleep_logs");
    const todaySteps = take<StepsLog | null>(settled, 4, null, "steps_logs");
    const recentSessions = take<WorkoutSession[]>(settled, 5, [], "workout_sessions");
    const recentWeight = take<WeightLog[]>(settled, 6, [], "weight_logs");

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

    const stream = await streamCoach(messages, context);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    console.error("[api/ai/coach]", err);
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Erreur serveur";
    const safe = message.length > 400 ? `${message.slice(0, 397)}…` : message;
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
