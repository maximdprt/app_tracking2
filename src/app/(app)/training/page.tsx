"use client";

import Link from "next/link";
import { Dumbbell, Plus, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { useWorkoutSessions } from "@/hooks/useWorkoutSession";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/services/supabase/client";
import { getWeeklyVolume } from "@/services/supabase/queries/stats";
import { formatDateRelative } from "@/utils/dates";
import { formatDuration } from "@/lib/format";

export default function TrainingPage() {
  const { data: user } = useUser();
  const sessionsQuery = useWorkoutSessions(10);

  const volumeQuery = useQuery({
    queryKey: ["weekly-volume", user?.id ?? null],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      return getWeeklyVolume(supabase, user.id, 1);
    },
  });

  const sessions = sessionsQuery.data ?? [];
  const completed = sessions.filter((s) => s.status === "completed").length;
  const lastVolume = volumeQuery.data?.[volumeQuery.data.length - 1]?.volume ?? 0;

  if (sessionsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Entraînement" />
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entraînement"
        subtitle="Logging, programmes, progression"
        actions={
          <Link href={ROUTES.trainingStart}>
            <Button>
              <Zap className="h-4 w-4" />
              Démarrer une séance
            </Button>
          </Link>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Séances 7j" value={completed} />
        <StatCard label="Volume semaine" value={lastVolume} suffix="kg" />
        <StatCard label="Total séances" value={sessions.length} />
      </div>

      <div className="flex gap-2">
        <Link href={ROUTES.trainingPrograms}>
          <Button variant="secondary">Voir mes programmes</Button>
        </Link>
        <Link href={ROUTES.trainingProgress}>
          <Button variant="secondary">Voir mes progressions</Button>
        </Link>
      </div>

      <h2 className="text-lg font-semibold tracking-tight">Séances récentes</h2>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Aucune séance"
          description="Lance ta première séance pour alimenter ta progression."
          action={
            <Link href={ROUTES.trainingStart}>
              <Button>
                <Plus className="h-4 w-4" />
                Démarrer
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {sessions.map((s) => (
            <Link key={s.id} href={`${ROUTES.training}/${s.id}`}>
              <Card className="flex h-full cursor-pointer items-center justify-between hover:border-border-strong">
                <div>
                  <p className="text-sm font-medium">{s.workout_name ?? "Séance libre"}</p>
                  <p className="text-xs text-text-soft capitalize">
                    {formatDateRelative(s.session_date)}
                    {s.duration_minutes ? ` · ${formatDuration(s.duration_minutes)}` : ""}
                  </p>
                </div>
                <Badge
                  variant={
                    s.status === "completed"
                      ? "success"
                      : s.status === "skipped"
                        ? "warning"
                        : "default"
                  }
                >
                  {s.status === "completed"
                    ? "Terminée"
                    : s.status === "skipped"
                      ? "Sautée"
                      : "Planifiée"}
                </Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
