"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Trash2, User, X } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useChatPanelStore } from "@/stores/useChatPanelStore";
import { useCoachChat } from "@/hooks/useCoachChat";
import { useChatSuggestions } from "@/utils/chat-suggestions";

const DEFAULT_SUGGESTIONS = [
  "Comment ajuster mes macros cette semaine ?",
  "Conseille-moi pour ma séance de demain.",
  "Pourquoi je ne perds pas de poids ?",
  "Ma fréquence d'entraînement est-elle bonne ?",
];

export function ChatPanel() {
  const isOpen = useChatPanelStore((s) => s.isOpen);
  const close = useChatPanelStore((s) => s.close);
  const { messages, streaming, send, clear } = useCoachChat();
  const suggestions = useChatSuggestions();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    send(input);
    setInput("");
  }

  const displaySuggestions = suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      side="right"
      className="flex w-[420px] max-w-full flex-col p-0"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-primary-soft">
            <Bot className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-semibold">Coach IA</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              title="Effacer la conversation"
              className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-danger"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Pose-moi tes questions</p>
              <p className="mt-1 text-xs text-muted">
                J'ai accès à ton activité complète d'aujourd'hui et des 7 derniers jours.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {displaySuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-text-soft hover:border-border-strong hover:text-text"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" ? (
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                    <Bot className="h-3 w-3" />
                  </div>
                ) : null}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary-soft text-text"
                      : "bg-surface-2 text-text-soft"
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.content || "..."}</p>
                </div>
                {m.role === "user" ? (
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
                    <User className="h-3 w-3" />
                  </div>
                ) : null}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer input */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Écris ton message…"
            disabled={streaming}
          />
          <Button
            onClick={handleSend}
            loading={streaming}
            disabled={!input.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
