"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Zap } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants/routes";
import { createClient } from "@/services/supabase/client";
import { getProgramDays, createSession } from "@/services/supabase/queries/workouts";
import { addExercise, addSet } from "@/services/supabase/queries/exercises";
import { useUser } from "@/hooks/useUser";
import { todayISO } from "@/utils/dates";
import { toUserMessage } from "@/lib/errors";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface PageProps {
  params: Promise<{ programId: string }>;
}

export default function ProgramDetailPage({ params }: PageProps) {
  const { programId } = use(params);
  const router = useRouter();
  const { data: user } = useUser();

  const daysQuery = useQuery({
    queryKey: ["program-days", programId],
    queryFn: async () => {
      const supabase = createClient();
      return getProgramDays(supabase, programId);
    },
  });

  const launchMutation = useMutation({
    mutationFn: async (dayId: string) => {
      if (!user?.id) throw new Error("Unauthorized");
      const supabase = createClient();
      const day = daysQuery.data?.days.find((d) => d.id === dayId);
      const planned = (daysQuery.data?.planned ?? []).filter((p) => p.workout_day_id === dayId);

      const session = await createSession(supabase, {
        user_id: user.id,
        workout_day_id: dayId,
        session_date: todayISO(),
        workout_name: day?.workout_name ?? "Séance",
        status: "planned",
      });

      // Pre-fill exercises with planned sets template
      for (const plan of planned) {
        const exercise = await addExercise(supabase, {
          session_id: session.id,
          user_id: user.id,
          exercise_name: plan.exercise_name,
          order_index: plan.order_index,
        });
        const targetSets = plan.target_sets ?? 3;
        for (let i = 1; i <= targetSets; i++) {
          await addSet(supabase, {
            performed_exercise_id: exercise.id,
            user_id: user.id,
            set_number: i,
            weight: plan.target_weight ?? null,
            reps: plan.target_reps ?? null,
            rpe: null,
            is_completed: false,
          });
        }
      }
      return session;
    },
    onSuccess: (session) => {
      toast.success("Séance créée");
      router.push(`${ROUTES.training}/${session.id}`);
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  if (daysQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.trainingPrograms}
        className="inline-flex items-center gap-1 text-xs text-text-soft hover:text-text"
      >
        <ChevronLeft className="h-3 w-3" />
        Retour
      </Link>

      <PageHeader title="Programme" subtitle="Sélectionne un jour pour le lancer." />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(daysQuery.data?.days ?? []).map((day) => {
          const planned = (daysQuery.data?.planned ?? []).filter(
            (p) => p.workout_day_id === day.id,
          );
          return (
            <Card key={day.id}>
              <CardHeader>
                <div>
                  <CardTitle>
                    {DAYS[day.day_of_week] ?? "?"} · {day.workout_name ?? "Séance"}
                  </CardTitle>
                  <CardDescription>
                    {day.is_rest_day
                      ? "Jour de repos"
                      : `${planned.length} exercices planifiés`}
                  </CardDescription>
                </div>
                {day.is_rest_day ? <Badge variant="warning">Repos</Badge> : null}
              </CardHeader>

              {!day.is_rest_day ? (
                <>
                  <div className="mb-3 space-y-1 text-xs">
                    {planned.slice(0, 3).map((p) => (
                      <p key={p.id} className="text-text-soft">
                        · {p.exercise_name}
                        {p.target_sets ? ` — ${p.target_sets}×${p.target_reps ?? "?"}` : ""}
                      </p>
                    ))}
                    {planned.length > 3 ? (
                      <p className="text-muted">+ {planned.length - 3} autres</p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => launchMutation.mutate(day.id)}
                    loading={launchMutation.isPending}
                    className="w-full"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Lancer ce jour
                  </Button>
                </>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
