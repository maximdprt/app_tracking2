import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ChatMessage } from "@/types/domain";

type Client = SupabaseClient<Database>;

export async function getOrCreateCoachThread(client: Client, userId: string): Promise<string> {
  const { data: row, error: selErr } = await client
    .from("chat_threads")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (selErr) throw selErr;
  if (row?.id) return row.id;

  const { data: ins, error: insErr } = await client
    .from("chat_threads")
    .insert({ user_id: userId, title: "Coach" })
    .select("id")
    .single();
  if (insErr) throw insErr;
  return ins.id;
}

export async function listCoachMessages(client: Client, threadId: string): Promise<ChatMessage[]> {
  const { data, error } = await client
    .from("chat_messages")
    .select("id,role,content")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const out: ChatMessage[] = [];
  for (const r of data ?? []) {
    if (r.role !== "user" && r.role !== "assistant") continue;
    out.push({ id: r.id, role: r.role, content: r.content ?? "" });
  }
  return out;
}

export async function insertCoachTurn(
  client: Client,
  threadId: string,
  userContent: string,
  assistantContent: string,
): Promise<void> {
  const { error } = await client.from("chat_messages").insert([
    { thread_id: threadId, role: "user", content: userContent },
    { thread_id: threadId, role: "assistant", content: assistantContent },
  ]);
  if (error) throw error;

  await client
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);
}

export async function clearCoachThreadMessages(client: Client, threadId: string): Promise<void> {
  const { error } = await client.from("chat_messages").delete().eq("thread_id", threadId);
  if (error) throw error;
  await client
    .from("chat_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);
}
