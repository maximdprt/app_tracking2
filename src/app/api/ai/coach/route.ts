import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { streamCoach, type MistralMessage } from "@/services/ai/mistral";
import { getRecentSummaries } from "@/services/supabase/queries/summaries";
import { getProfile } from "@/services/supabase/queries/profile";

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

    const [profile, summaries] = await Promise.all([
      getProfile(supabase, user.id),
      getRecentSummaries(supabase, user.id, 7),
    ]);

    const context = {
      goal: profile?.goal_type ?? null,
      targets: {
        calories: profile?.target_daily_calories ?? null,
        protein: profile?.target_protein ?? null,
        carbs: profile?.target_carbs ?? null,
        fats: profile?.target_fats ?? null,
      },
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
