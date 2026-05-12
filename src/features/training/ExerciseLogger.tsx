"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SetRow } from "@/features/training/SetRow";
import { createClient } from "@/services/supabase/client";
import { addSet, deleteExercise } from "@/services/supabase/queries/exercises";
import { totalVolume, maxOneRepMax } from "@/utils/workouts";
import { toUserMessage } from "@/lib/errors";
import type { ExerciseSet, PerformedExercise } from "@/types/domain";

interface ExerciseLoggerProps {
  exercise: PerformedExercise & { sets: ExerciseSet[] };
  userId: string;
  previousBestVolume: number;
}

export function ExerciseLogger({ exercise, userId, previousBestVolume }: ExerciseLoggerProps) {
  const queryClient = useQueryClient();

  const addSetMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const lastSet = exercise.sets[exercise.sets.length - 1];
      await addSet(supabase, {
        performed_exercise_id: exercise.id,
        user_id: userId,
        set_number: exercise.sets.length + 1,
        weight: lastSet?.weight ?? null,
        reps: lastSet?.reps ?? null,
        rpe: null,
        is_completed: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-session"] });
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  const removeExerciseMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      await deleteExercise(supabase, exercise.id);
    },
    onSuccess: () => {
      toast.success("Exercice supprimé");
      queryClient.invalidateQueries({ queryKey: ["workout-session"] });
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  const volume = totalVolume(exercise.sets);
  const e1rm = maxOneRepMax(exercise.sets);

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{exercise.exercise_name}</h3>
          <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-mono text-text-soft">
            <Badge variant="outline">{exercise.sets.length} sets</Badge>
            <Badge variant="outline">{Math.round(volume)} kg vol</Badge>
            {e1rm > 0 ? <Badge variant="primary">e1RM {Math.round(e1rm)} kg</Badge> : null}
          </div>
        </div>
        <ConfirmDialog
          title="Supprimer cet exercice ?"
          description="Tous les sets seront perdus."
          confirmLabel="Supprimer"
          onConfirm={() => removeExerciseMutation.mutateAsync()}
          trigger={
            <button className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-danger">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          }
        />
      </div>

      <div className="mb-3 grid grid-cols-[28px_1fr_1fr_70px_36px_28px] gap-2 px-2 text-[10px] uppercase text-muted">
        <span>#</span>
        <span className="text-center">Poids</span>
        <span className="text-center">Reps</span>
        <span className="text-center">RPE</span>
        <span />
        <span />
      </div>

      <div className="space-y-1.5">
        {exercise.sets.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface/50 py-4 text-center text-xs text-muted">
            Aucun set enregistré
          </p>
        ) : (
          exercise.sets.map((set) => (
            <SetRow
              key={set.id}
              set={set}
              previousBestVolume={previousBestVolume}
              onDeleted={() => queryClient.invalidateQueries({ queryKey: ["workout-session"] })}
            />
          ))
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-3 w-full"
        onClick={() => addSetMutation.mutate()}
        loading={addSetMutation.isPending}
      >
        <Plus className="h-3.5 w-3.5" />
        Ajouter un set
      </Button>
    </Card>
  );
}
