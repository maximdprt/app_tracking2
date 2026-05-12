"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, Square, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCoachChat } from "@/hooks/useCoachChat";
import { useChatSuggestions } from "@/utils/chat-suggestions";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/domain";

const DEFAULT_SUGGESTIONS = [
  "Comment ajuster mes macros cette semaine ?",
  "Conseille-moi pour ma séance de demain.",
  "Pourquoi je n’atteins pas mes objectifs ?",
  "Comment relancer ma motivation ?",
];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-text-soft/60"
          style={{ animationDelay: `${i * 140}ms` }}
        />
      ))}
    </span>
  );
}

function MessageBubble({ message, streamingTail }: { message: ChatMessage; streamingTail: boolean }) {
  const isUser = message.role === "user";
  const isEmptyAssistant = message.role === "assistant" && message.content.trim() === "";

  return (
    <div className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full",
          isUser ? "bg-surface-2 text-muted" : "bg-primary-container text-on-primary-container",
        )}
        aria-hidden
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>
      <div
        className={cn(
          "max-w-80 rounded-2xl px-3.5 py-2.5 md-body-medium",
          isUser
            ? "rounded-br-md bg-primary-container/35 text-text"
            : "rounded-bl-md bg-surface-2 text-text-soft",
        )}
      >
        {isEmptyAssistant && streamingTail ? (
          <p className="flex min-h-5 items-center gap-2 text-muted">
            <TypingDots />
            <span className="sr-only">Le coach rédige…</span>
          </p>
        ) : (
          <p className="wrap-break-word whitespace-pre-wrap leading-relaxed">
            {message.content || (streamingTail ? "…" : "")}
          </p>
        )}
      </div>
    </div>
  );
}

interface CoachChatThreadProps {
  /** Hauteur minimum du fil (ex. page coach en carte) */
  minListHeight?: string;
  showKeyboardHint?: boolean;
  className?: string;
}

export function CoachChatThread({
  minListHeight,
  showKeyboardHint = true,
  className,
}: CoachChatThreadProps) {
  const { messages, streaming, send, stop } = useCoachChat();
  const suggestions = useChatSuggestions();

  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const displaySuggestions = useMemo(
    () => (suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS).slice(0, 4),
    [suggestions],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  function handleSend() {
    const t = input.trim();
    if (!t) return;
    void send(t);
    setInput("");
    taRef.current?.focus();
  }

  const last = messages[messages.length - 1];
  const showStreamingHint = streaming && last?.role === "assistant";

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-1",
          minListHeight,
        )}
      >
        {messages.length === 0 ? (
          <div className="flex min-h-[min(50vh,18rem)] flex-col items-center justify-center gap-5 px-1 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-container/50 md-elevation-1">
              <Bot className="h-6 w-6 text-on-primary-container" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="md-title-medium text-text">Parlons de ton entraînement</p>
              <p className="md-body-medium text-pretty text-muted">
                Conseils nutrition, séances, sommeil et objectifs — à partir de tes données.
              </p>
            </div>
            <div className="flex w-full max-w-md flex-col gap-2">
              {displaySuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  disabled={streaming}
                  className="rounded-full border border-outline-variant/80 bg-surface-2 px-4 py-2.5 text-left md-body-medium text-text-soft transition-colors hover:border-outline hover:bg-surface-bright hover:text-text disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pr-1">
            {messages.map((m, i) => (
              <MessageBubble
                key={m.id}
                message={m}
                streamingTail={Boolean(
                  streaming && i === messages.length - 1 && m.role === "assistant",
                )}
              />
            ))}
            <div ref={endRef} className="h-px w-full shrink-0" />
          </div>
        )}
      </div>

      {showStreamingHint ? (
        <p className="shrink-0 border-t border-border/40 py-1.5 md-label-medium text-muted">
          Génération en cours…
        </p>
      ) : null}

      <div className="mt-3 shrink-0 border-t border-border pt-3">
        <div className="flex items-end gap-2">
          <div className="relative min-h-11 flex-1 rounded-3xl border border-outline-variant bg-surface-2 px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!streaming) handleSend();
                }
              }}
              placeholder="Message…"
              disabled={streaming}
              rows={1}
              className="max-h-32 min-h-9 w-full resize-y bg-transparent py-1 md-body-medium text-text placeholder:text-muted focus:outline-none disabled:opacity-60"
              aria-label="Votre message"
            />
          </div>
          {streaming ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={stop}
              className="shrink-0"
              title="Arrêter"
              aria-label="Arrêter la génération"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
              className="shrink-0"
              title="Envoyer"
              aria-label="Envoyer"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
        {showKeyboardHint ? (
          <p className="mt-2 hidden text-center md-label-medium text-muted sm:block">
            Entrée pour envoyer · Maj+Entrée pour un saut de ligne
          </p>
        ) : null}
      </div>
    </div>
  );
}
