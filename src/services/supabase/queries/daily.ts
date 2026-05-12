import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { format, subDays } from "date-fns";

type Client = SupabaseClient<Database>;
export type SleepLog = Database["public"]["Tables"]["sleep_logs"]["Row"];
export type StepsLog = Database["public"]["Tables"]["steps_logs"]["Row"];
export type WeightLog = Database["public"]["Tables"]["weight_logs"]["Row"];

// ─── Sleep ───────────────────────────────────────────────────────────────────

export async function getSleepByDate(
  client: Client,
  userId: string,
  date: string,
): Promise<SleepLog | null> {
  const { data, error } = await client
    .from("sleep_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSleep(
  client: Client,
  payload: Database["public"]["Tables"]["sleep_logs"]["Insert"],
): Promise<SleepLog> {
  const { data, error } = await client
    .from("sleep_logs")
    .upsert(payload, { onConflict: "user_id,log_date" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getSleepRange(
  client: Client,
  userId: string,
  days: number,
): Promise<SleepLog[]> {
  const since = format(subDays(new Date(), days), "yyyy-MM-dd");
  const { data, error } = await client
    .from("sleep_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("log_date", since)
    .order("log_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ─── Steps ───────────────────────────────────────────────────────────────────

export async function getStepsByDate(
  client: Client,
  userId: string,
  date: string,
): Promise<StepsLog | null> {
  const { data, error } = await client
    .from("steps_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertSteps(
  client: Client,
  payload: Database["public"]["Tables"]["steps_logs"]["Insert"],
): Promise<StepsLog> {
  const { data, error } = await client
    .from("steps_logs")
    .upsert(payload, { onConflict: "user_id,log_date" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getStepsRange(
  client: Client,
  userId: string,
  days: number,
): Promise<StepsLog[]> {
  const since = format(subDays(new Date(), days), "yyyy-MM-dd");
  const { data, error } = await client
    .from("steps_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("log_date", since)
    .order("log_date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ─── Weight ──────────────────────────────────────────────────────────────────

export async function getWeightByDate(
  client: Client,
  userId: string,
  date: string,
): Promise<WeightLog | null> {
  const { data, error } = await client
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertWeight(
  client: Client,
  payload: Database["public"]["Tables"]["weight_logs"]["Insert"],
): Promise<WeightLog> {
  const { data, error } = await client
    .from("weight_logs")
    .upsert(payload, { onConflict: "user_id,log_date" })
    .select("*")
    .single();
  if (error) throw error;

  // Keep users_profiles.weight up to date with the most recent weight log
  const { data: latest } = await client
    .from("weight_logs")
    .select("log_date")
    .eq("user_id", payload.user_id)
    .order("log_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest || latest.log_date <= data.log_date) {
    await client
      .from("users_profiles")
      .update({ weight: data.weight })
      .eq("user_id", payload.user_id);
  }

  return data;
}

export async function getWeightHistoryReal(
  client: Client,
  userId: string,
  days?: number,
): Promise<WeightLog[]> {
  let query = client
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: true });

  if (days !== undefined) {
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");
    query = query.gte("log_date", since);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getLatestWeight(
  client: Client,
  userId: string,
): Promise<WeightLog | null> {
  const { data, error } = await client
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
