"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Sparkles, Bot, User, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCoachStore } from "@/stores/useCoachStore";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/services/supabase/client";
import { getDailySummary } from "@/services/supabase/queries/summaries";
import { todayISO } from "@/utils/dates";
import { toUserMessage } from "@/lib/errors";

const SUGGESTIONS = [
  "Comment ajuster mes macros cette semaine ?",
  "Conseille-moi pour ma séance de demain.",
  "Pourquoi je ne perds pas de poids ?",
  "Ma fréquence d'entraînement est-elle bonne ?",
];

export default function CoachPage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const messages = useCoachStore((s) => s.messages);
  const addMessage = useCoachStore((s) => s.addMessage);
  const appendToLastAssistant = useCoachStore((s) => s.appendToLastAssistant);

  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const summaryQuery = useQuery({
    queryKey: ["daily-summary", user?.id ?? null, todayISO()],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return null;
      const supabase = createClient();
      return getDailySummary(supabase, user.id, todayISO());
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/summary", { method: "POST" });
      if (!res.ok) throw new Error("Erreur génération");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Résumé généré");
      queryClient.invalidateQueries({ queryKey: ["daily-summary"] });
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    addMessage({ id: crypto.randomUUID(), role: "user", content: trimmed });
    setInput("");
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coach IA"
        subtitle="Synthèse intelligente et conseils personnalisés"
      />

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Daily summary */}
        <Card className="lg:col-span-5 bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.06)_0%,transparent_60%)]">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Résumé du jour
              </CardTitle>
              <CardDescription>Synthèse de ta journée actuelle.</CardDescription>
            </div>
          </CardHeader>

          {summaryQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          ) : summaryQuery.data?.global_summary ? (
            <div className="space-y-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-soft">
                {summaryQuery.data.global_summary}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => generateMutation.mutate()}
                loading={generateMutation.isPending}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Régénérer
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted">Pas encore de résumé pour aujourd'hui.</p>
              <Button
                onClick={() => generateMutation.mutate()}
                loading={generateMutation.isPending}
              >
                <Sparkles className="h-4 w-4" />
                Générer mon résumé
              </Button>
            </div>
          )}
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Chat
            </CardTitle>
          </CardHeader>

          <div className="flex h-[480px] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pose-moi tes questions</p>
                    <p className="mt-1 text-xs text-muted">
                      J'ai accès à ton activité des 7 derniers jours.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((s) => (
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
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" ? (
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    ) : null}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        m.role === "user"
                          ? "bg-primary-soft text-text"
                          : "bg-surface-2 text-text-soft"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.content || "..."}</p>
                    </div>
                    {m.role === "user" ? (
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    ) : null}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Écris ton message..."
                disabled={streaming}
              />
              <Button onClick={() => send(input)} loading={streaming} disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
