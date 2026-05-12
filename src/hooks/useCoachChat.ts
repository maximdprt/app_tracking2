"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCoachStore } from "@/stores/useCoachStore";
import { toUserMessage } from "@/lib/errors";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/services/supabase/client";
import {
  clearCoachThreadMessages,
  getOrCreateCoachThread,
  insertCoachTurn,
  listCoachMessages,
} from "@/services/supabase/queries/chatCoach";

/** Corps attendu par POST /api/ai/coach (sans message système — ajouté côté serveur). */
type CoachApiTurn = { role: "user" | "assistant"; content: string };

export function useCoachChat() {
  const { data: user } = useUser();
  const messages = useCoachStore((s) => s.messages);
  const threadId = useCoachStore((s) => s.threadId);
  const addMessage = useCoachStore((s) => s.addMessage);
  const appendToLastAssistant = useCoachStore((s) => s.appendToLastAssistant);
  const trimTrailingEmptyAssistant = useCoachStore((s) => s.trimTrailingEmptyAssistant);
  const resetLocal = useCoachStore((s) => s.resetLocal);

  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const { setThreadId, setMessages } = useCoachStore.getState();
      const uid = user?.id ?? null;
      if (!uid) {
        setThreadId(null);
        setMessages([]);
        return;
      }

      try {
        const sb = createClient();
        const tid = await getOrCreateCoachThread(sb, uid);
        if (cancelled) return;
        setThreadId(tid);
        const rows = await listCoachMessages(sb, tid);
        if (cancelled) return;
        setMessages(rows);
      } catch {
        if (!cancelled) toast.error("Impossible de charger l’historique coach.");
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  async function persistLastTurn(sb: ReturnType<typeof createClient>): Promise<void> {
    const tid = useCoachStore.getState().threadId;
    if (!tid) return;
    const msgs = useCoachStore.getState().messages;
    if (msgs.length < 2) return;
    const a = msgs[msgs.length - 1]!;
    const u = msgs[msgs.length - 2]!;
    if (u.role !== "user" || a.role !== "assistant") return;
    const asst = a.content.trim();
    if (!asst) return;
    await insertCoachTurn(sb, tid, u.content, asst);
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const prior = useCoachStore.getState().messages;
    const apiMessages: CoachApiTurn[] = [
      ...prior.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: trimmed },
    ];

    addMessage({ id: crypto.randomUUID(), role: "user", content: trimmed });
    addMessage({ id: crypto.randomUUID(), role: "assistant", content: "" });

    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let detail = `Erreur ${res.status}`;
        try {
          const errBody = (await res.json()) as { error?: string };
          if (errBody.error) detail = errBody.error;
        } catch {
          /* ignore */
        }
        throw new Error(detail);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        appendToLastAssistant(decoder.decode(value, { stream: true }));
      }

      const sb = createClient();
      await persistLastTurn(sb);
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      const legacyAbort = err instanceof Error && err.name === "AbortError";

      trimTrailingEmptyAssistant();

      if (aborted || legacyAbort) {
        return;
      }

      toast.error(toUserMessage(err));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  async function clear() {
    const tid = useCoachStore.getState().threadId;
    resetLocal();
    if (!user?.id || !tid) return;
    try {
      const sb = createClient();
      await clearCoachThreadMessages(sb, tid);
    } catch {
      toast.error("Impossible de vider la conversation côté serveur.");
    }
  }

  return { messages, threadId, streaming, send, stop, clear };
}
