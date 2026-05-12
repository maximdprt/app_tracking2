"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, TrendingUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { differenceInMinutes, parseISO } from "date-fns";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { ExerciseLogger } from "@/features/training/ExerciseLogger";
import { ExerciseProgressChart } from "@/features/training/ExerciseProgressChart";
import { AutoProgressPanel } from "@/features/training/AutoProgressPanel";
import { ROUTES } from "@/constants/routes";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import { useUser } from "@/hooks/useUser";
import { createClient } from "@/services/supabase/client";
import { addExercise } from "@/services/supabase/queries/exercises";
import { completeSession } from "@/services/supabase/queries/workouts";
import { upsertWorkoutMetrics } from "@/services/supabase/queries/workoutMetrics";
import { totalVolume } from "@/utils/workouts";
import { toUserMessage } from "@/lib/errors";
import { todayISO } from "@/utils/dates";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function SessionDetailPage({ params }: PageProps) {
  const { sessionId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const sessionQuery = useWorkoutSession(sessionId);

  const [addOpen, setAddOpen] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [progressExercise, setProgressExercise] = useState<string | null>(null);

  const session = sessionQuery.data;

  // Live timer
  useEffect(() => {
    if (!session) return;
    const start = parseISO(session.created_at);
    const tick = () => setElapsed(differenceInMinutes(new Date(), start));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [session]);

  const sessionVolume = useMemo(() => {
    if (!session) return 0;
    return session.exercises.reduce((acc, ex) => acc + totalVolume(ex.sets), 0);
  }, [session]);

  const addExerciseMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Unauthorized");
      const supabase = createClient();
      await addExercise(supabase, {
        session_id: sessionId,
        user_id: user.id,
        exercise_name: exerciseName.trim(),
        order_index: (session?.exercises.length ?? 0) + 1,
      });
    },
    onSuccess: () => {
      toast.success("Exercice ajouté");
      setAddOpen(false);
      setExerciseName("");
      queryClient.invalidateQueries({ queryKey: ["workout-session"] });
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !session) throw new Error("Unauthorized");
      const supabase = createClient();
      await completeSession(supabase, sessionId, elapsed);

      // Save workout metrics for each exercise (best e1RM, volume)
      await Promise.allSettled(
        session.exercises.map((ex) =>
          upsertWorkoutMetrics(supabase, {
            userId: user.id,
            exerciseName: ex.exercise_name,
            sessionId,
            sessionDate: session.session_date ?? todayISO(),
            sets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
          }),
        ),
      );

      // Update workout streak (upsert_streak RPC added in migration 0008)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .rpc("upsert_streak", {
          p_user_id: user.id,
          p_type: "workout",
          p_date: session.session_date ?? todayISO(),
        })
        .then(() => {})
        .catch(() => {});
    },
    onSuccess: () => {
      toast.success("Séance terminée 🎉");
      queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["auto-progress"] });
      router.push(ROUTES.training);
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <Link href={ROUTES.training} className="text-xs text-text-soft hover:text-text">
          ← Retour
        </Link>
        <p className="text-sm text-muted">Séance introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      <Link
        href={ROUTES.training}
        className="inline-flex items-center gap-1 text-xs text-text-soft hover:text-text"
      >
        <ChevronLeft className="h-3 w-3" />
        Retour
      </Link>

      <PageHeader
        title={session.workout_name ?? "Séance"}
        subtitle={`${elapsed} min écoulées · ${session.exercises.length} exercices`}
        actions={
          <Badge
            variant={
              session.status === "completed"
                ? "success"
                : session.status === "skipped"
                  ? "warning"
                  : "default"
            }
          >
            {session.status === "completed"
              ? "Terminée"
              : session.status === "skipped"
                ? "Sautée"
                : "En cours"}
          </Badge>
        }
      />

      <div className="space-y-4">
        {session.exercises.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 py-12 text-center">
            <p className="text-sm text-muted">Aucun exercice</p>
            <Button onClick={() => setAddOpen(true)} className="mt-3">
              <Plus className="h-4 w-4" />
              Ajouter un exercice
            </Button>
          </div>
        ) : (
          session.exercises.map((ex) => (
            <div key={ex.id} className="space-y-2">
              <ExerciseLogger
                exercise={ex}
                userId={user?.id ?? ""}
                previousBestVolume={0}
              />
              <button
                type="button"
                onClick={() => setProgressExercise(ex.exercise_name)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-text-soft hover:bg-surface-2 hover:text-text"
              >
                <TrendingUp className="h-3 w-3" />
                Voir progression
              </button>
            </div>
          ))
        )}
      </div>

      {session.exercises.length > 0 ? (
        <Button onClick={() => setAddOpen(true)} variant="secondary" className="w-full">
          <Plus className="h-4 w-4" />
          Ajouter un exercice
        </Button>
      ) : null}

      {/* Sticky bottom bar */}
      {session.status === "planned" ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 px-6 py-3 backdrop-blur-md lg:left-65">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase text-muted">Volume séance</p>
              <p className="font-mono text-xl font-semibold">
                {Math.round(sessionVolume)} <span className="text-xs text-text-soft">kg</span>
              </p>
            </div>
            <ConfirmDialog
              title="Terminer la séance ?"
              description="Tu pourras toujours consulter le détail mais plus modifier les sets."
              confirmLabel="Terminer"
              variant="default"
              onConfirm={() => finishMutation.mutateAsync()}
              trigger={<Button size="lg">Terminer la séance</Button>}
            />
          </div>
        </div>
      ) : null}

      {/* Auto-progression panel — shown when session is completed */}
      {session.status === "completed" && user?.id && session.exercises.length > 0 ? (
        <AutoProgressPanel
          userId={user.id}
          exerciseNames={session.exercises.map((e) => e.exercise_name)}
        />
      ) : null}

      {/* Add exercise dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen} title="Ajouter un exercice">
        <div className="space-y-4">
          <Input
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="ex: Squat, Développé couché..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && exerciseName.trim()) {
                addExerciseMutation.mutate();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => addExerciseMutation.mutate()}
              loading={addExerciseMutation.isPending}
              disabled={!exerciseName.trim()}
            >
              Ajouter
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Progress dialog */}
      <Dialog
        open={progressExercise !== null}
        onOpenChange={(open) => {
          if (!open) setProgressExercise(null);
        }}
        title={progressExercise ? `Progression — ${progressExercise}` : "Progression"}
      >
        {progressExercise && user?.id ? (
          <ExerciseProgressChart exerciseName={progressExercise} userId={user.id} />
        ) : null}
      </Dialog>
    </div>
  );
}
