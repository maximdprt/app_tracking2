"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExerciseProgressChart } from "@/features/training/ExerciseProgressChart";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/services/supabase/client";

export default function TrainingProgressPage() {
  const { data: user } = useUser();
  const [selected, setSelected] = useState<string | null>(null);

  const exercisesQuery = useQuery({
    queryKey: ["distinct-exercises", user?.id ?? null],
    enabled: Boolean(user?.id),
    staleTime: 120_000,
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      const { data, error } = await supabase
        .from("performed_exercises")
        .select("exercise_name")
        .eq("user_id", user.id);
      if (error) throw error;
      // Deduplicate and sort
      const names = Array.from(new Set((data ?? []).map((r) => r.exercise_name))).sort();
      return names;
    },
  });

  if (exercisesQuery.isLoading) {
    return (
      <div className="space-y-10">
        <PageHeader title="Progressions" subtitle="Évolution par exercice" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const exercises = exercisesQuery.data ?? [];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Progressions"
        subtitle="Évolution de tes performances par exercice"
      />

      {exercises.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Aucun exercice loggé"
          description="Lance une séance et logue tes exercices pour voir ta progression."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((name) => (
            <Card
              key={name}
              className="cursor-pointer transition-colors hover:border-border-strong"
              onClick={() => setSelected(name)}
            >
              <CardHeader>
                <CardTitle className="text-sm">{name}</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <p className="text-xs text-text-soft">Cliquer pour voir la progression →</p>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? `Progression — ${selected}` : "Progression"}
      >
        {selected && user?.id ? (
          <ExerciseProgressChart exerciseName={selected} userId={user.id} />
        ) : null}
      </Dialog>
    </div>
  );
}
