"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCoachStore } from "@/stores/useCoachStore";
import { toUserMessage } from "@/lib/errors";

export function useCoachChat() {
  const messages = useCoachStore((s) => s.messages);
  const addMessage = useCoachStore((s) => s.addMessage);
  const appendToLastAssistant = useCoachStore((s) => s.appendToLastAssistant);
  const clear = useCoachStore((s) => s.clear);

  const [streaming, setStreaming] = useState(false);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    addMessage({ id: crypto.randomUUID(), role: "user", content: trimmed });
    setStreaming(true);
    addMessage({ id: crypto.randomUUID(), role: "assistant", content: "" });

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: trimmed }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Erreur de streaming");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        appendToLastAssistant(chunk);
      }
    } catch (err) {
      toast.error(toUserMessage(err));
    } finally {
      setStreaming(false);
    }
  }

  return { messages, streaming, send, clear };
}
