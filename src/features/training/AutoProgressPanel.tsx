"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, ChevronRight, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/services/supabase/client";
import { getAutoProgressSuggestion } from "@/services/supabase/queries/workoutMetrics";
import type { AutoProgressSuggestion } from "@/services/supabase/queries/workoutMetrics";

interface Props {
  userId: string;
  exerciseNames: string[];
}

const ICONS: Record<AutoProgressSuggestion["suggestion"], React.ReactNode> = {
  increase_weight: <TrendingUp className="h-4 w-4 stroke-[1.5] text-emerald-500" />,
  increase_reps: <TrendingUp className="h-4 w-4 stroke-[1.5] text-blue-500" />,
  increase_sets: <ChevronRight className="h-4 w-4 stroke-[1.5] text-blue-500" />,
  deload: <TrendingDown className="h-4 w-4 stroke-[1.5] text-amber-500" />,
  maintain: <Minus className="h-4 w-4 stroke-[1.5] text-text-soft" />,
};

const BADGES: Record<
  AutoProgressSuggestion["suggestion"],
  { label: string; className: string }
> = {
  increase_weight: { label: "Augmente la charge", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  increase_reps: { label: "Augmente les reps", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  increase_sets: { label: "Ajoute une série", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  deload: { label: "Déload conseillé", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  maintain: { label: "Continue", className: "bg-surface-2 text-text-soft" },
};

export function AutoProgressPanel({ userId, exerciseNames }: Props) {
  const queries = useQuery({
    queryKey: ["auto-progress", userId, exerciseNames],
    enabled: Boolean(userId) && exerciseNames.length > 0,
    queryFn: async () => {
      const supabase = createClient();
      return Promise.allSettled(
        exerciseNames.map((name) => getAutoProgressSuggestion(supabase, userId, name)),
      ).then((results) =>
        results
          .map((r) => (r.status === "fulfilled" ? r.value : null))
          .filter((v): v is AutoProgressSuggestion => v !== null),
      );
    },
  });

  const suggestions = queries.data ?? [];
  const actionable = suggestions.filter(
    (s) => s.suggestion !== "maintain",
  );

  if (queries.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progression auto</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      </Card>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Zap className="inline h-4 w-4 stroke-[1.5] text-(--lift-text-primary)" /> Suggestions de progression
        </CardTitle>
      </CardHeader>

      <div className="space-y-2">
        {(actionable.length > 0 ? actionable : suggestions).map((s) => {
          const badge = BADGES[s.suggestion];
          return (
            <div
              key={s.exerciseName}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-3"
            >
              <div className="mt-0.5 shrink-0">{ICONS[s.suggestion]}</div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{s.exerciseName}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-text-soft">{s.detail}</p>
                {s.lastE1rm ? (
                  <p className="mt-1 font-mono text-[11px] text-muted">
                    e1RM : {s.lastE1rm}kg
                    {s.previousE1rm ? ` (prec. ${s.previousE1rm}kg)` : ""}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
