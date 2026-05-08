import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SummaryType = "sport_weekly" | "food_daily" | "global";

const SYSTEM_PROMPT = `Tu es un coach sportif et nutritionnel professionnel. Tu analyses uniquement les donnees fournies.
Tu ne donnes jamais de diagnostic medical. Tes recommandations sont prudentes, simples, actionnables.
Tu ecris en francais, ton ton est motivant mais factuel.
Reponds en 4-6 phrases maximum. N'invente aucune donnee.`;

const makePrompt = (type: SummaryType, context: Record<string, unknown>): string => {
  const serialized = JSON.stringify(context);

  if (type === "sport_weekly") {
    return `Analyse hebdomadaire sport. Donnees: ${serialized}. Donne un bilan adherence/charge, un point fort, un risque de fatigue, et 2 actions concretes.`;
  }

  if (type === "food_daily") {
    return `Analyse nutrition journaliere. Donnees: ${serialized}. Compare kcal/macros aux objectifs, donne 2 ajustements simples pour demain.`;
  }

  return `Analyse globale lifestyle. Donnees: ${serialized}. Fais une synthese sport + nutrition + habitudes avec priorite unique.`;
};

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing auth header" }), { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { type, context } = (await req.json()) as { type: SummaryType; context: Record<string, unknown> };
  const mistralKey = Deno.env.get("MISTRAL_API_KEY");
  if (!mistralKey) {
    return new Response(JSON.stringify({ error: "MISTRAL_API_KEY missing" }), { status: 500 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mistralKey}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: makePrompt(type, context) },
        ],
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      return new Response(JSON.stringify({ error: "Mistral request failed", details }), { status: 500 });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    const summaryDate = new Date().toISOString().slice(0, 10);

    const payload: Record<string, string> = {};
    if (type === "sport_weekly") payload.sport_summary = text;
    if (type === "food_daily") payload.food_summary = text;
    if (type === "global") payload.global_summary = text;

    await supabase
      .from("daily_summaries")
      .upsert({ user_id: authData.user.id, summary_date: summaryDate, ...payload }, { onConflict: "user_id,summary_date" });

    return new Response(JSON.stringify({ text }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
});
