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
      <div className="space-y-10">
        <PageHeader title="Entraînement" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title="Entraînement"
        actions={
          <div className="flex gap-2">
            <Link href={ROUTES.trainingPrograms}>
              <Button variant="secondary">Programmes</Button>
            </Link>
            <Link href={ROUTES.trainingProgress}>
              <Button variant="secondary">Progression</Button>
            </Link>
          </div>
        }
      />

      {/* ── Niveau 1 : CTA hero ── */}
      <section>
        <Card className="p-6 sm:p-8">
          <p className="lift-label mb-3">Prochaine séance</p>
          <Link href={ROUTES.trainingStart}>
            <Button size="lg" className="w-full sm:w-auto">
              <Zap className="h-4 w-4" />
              Démarrer une séance
            </Button>
          </Link>
        </Card>
      </section>

      {/* ── Niveau 2 : Stats semaine ── */}
      <section>
        <p className="lift-label mb-4">Cette semaine</p>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <StatCard label="Séances complétées" value={completed} size="sm" />
          </Card>
          <Card className="p-4">
            <StatCard label="Volume total" value={lastVolume} suffix="kg" size="sm" />
          </Card>
        </div>
      </section>

      {/* ── Niveau 3 : Historique ── */}
      <section>
        <p className="lift-label mb-4">Séances récentes</p>
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
                <Card className="flex h-full cursor-pointer items-center justify-between p-4 hover:border-border-strong">
                  <div className="min-w-0">
                    <p className="lift-title">{s.workout_name ?? "Séance libre"}</p>
                    <p className="lift-body-soft capitalize mt-0.5">
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
      </section>
    </div>
  );
}
