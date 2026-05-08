import { supabase } from "@/src/services/supabase";
import type { AiSummaryRequest } from "@/src/types/ai";

export async function requestAiSummary(payload: AiSummaryRequest): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ text: string }>("mistral-proxy", { body: payload });
  if (error) throw error;
  return data?.text ?? "";
}
