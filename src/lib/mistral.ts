import { supabase } from "@/lib/supabase";

type MistralSummaryType = "sport_weekly" | "food_daily" | "global";

interface MistralRequest<TContext> {
  type: MistralSummaryType;
  context: TContext;
}

export async function requestMistralSummary<TContext extends Record<string, unknown>>(
  payload: MistralRequest<TContext>,
): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ text: string }>("mistral-proxy", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data?.text ?? "";
}
