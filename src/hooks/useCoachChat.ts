"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useCoachStore } from "@/stores/useCoachStore";
import { toUserMessage } from "@/lib/errors";

/** Corps attendu par POST /api/ai/coach (sans message système — ajouté côté serveur). */
type CoachApiTurn = { role: "user" | "assistant"; content: string };

export function useCoachChat() {
  const messages = useCoachStore((s) => s.messages);
  const addMessage = useCoachStore((s) => s.addMessage);
  const appendToLastAssistant = useCoachStore((s) => s.appendToLastAssistant);
  const trimTrailingEmptyAssistant = useCoachStore((s) => s.trimTrailingEmptyAssistant);
  const clear = useCoachStore((s) => s.clear);

  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

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

  return { messages, streaming, send, stop, clear };
}
