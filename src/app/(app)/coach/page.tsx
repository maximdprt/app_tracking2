"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Bot, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { CoachChatThread } from "@/features/coach/CoachChatThread";
import { useCoachChat } from "@/hooks/useCoachChat";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/services/supabase/client";
import { getDailySummary } from "@/services/supabase/queries/summaries";
import { todayISO } from "@/utils/dates";
import { toUserMessage } from "@/lib/errors";

export default function CoachPage() {
  const { data: user } = useUser();
  const queryClient = useQueryClient();
  const { messages, clear } = useCoachChat();

  const summaryQuery = useQuery({
    queryKey: ["daily-summary", user?.id ?? null, todayISO()],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return null;
      const supabase = createClient();
      return getDailySummary(supabase, user.id, todayISO());
    },
  });

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coach IA"
        subtitle="Synthèse intelligente et conseils personnalisés"
        actions={
          messages.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => void clear()}>
              Effacer la conversation
            </Button>
          ) : undefined
        }
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

        {/* Chat — même logique que le panneau flottant (store partagé) */}
        <Card className="flex min-h-112 flex-col lg:col-span-7 lg:min-h-128">
          <CardHeader className="shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              Conversation
            </CardTitle>
            <CardDescription>Même historique que le coach accessible depuis le bouton flottant.</CardDescription>
          </CardHeader>

          <div className="flex min-h-0 flex-1 flex-col px-2 pb-6 pt-0 sm:px-4">
            <CoachChatThread showKeyboardHint />
          </div>
        </Card>
      </div>
    </div>
  );
}
