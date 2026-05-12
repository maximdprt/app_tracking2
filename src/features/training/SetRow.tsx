"use client";

import { useEffect, useState } from "react";
import { Check, Trophy, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { createClient } from "@/services/supabase/client";
import { updateSet, deleteSet } from "@/services/supabase/queries/exercises";
import type { ExerciseSet } from "@/types/domain";
import { setVolume } from "@/utils/workouts";
import { toUserMessage } from "@/lib/errors";

interface SetRowProps {
  set: ExerciseSet;
  previousBestVolume: number;
  onDeleted: () => void;
}

export function SetRow({ set, previousBestVolume, onDeleted }: SetRowProps) {
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState(set.weight ?? 0);
  const [reps, setReps] = useState(set.reps ?? 0);
  const [rpe, setRpe] = useState(set.rpe ?? 0);
  const [completed, setCompleted] = useState(set.is_completed);

  const debouncedWeight = useDebounce(weight, 800);
  const debouncedReps = useDebounce(reps, 800);
  const debouncedRpe = useDebounce(rpe, 800);

  const updateMutation = useMutation({
    mutationFn: async (patch: Partial<{ weight: number; reps: number; rpe: number; is_completed: boolean }>) => {
      const supabase = createClient();
      await updateSet(supabase, set.id, patch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-session"] });
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      await deleteSet(supabase, set.id);
    },
    onSuccess: () => {
      onDeleted();
      queryClient.invalidateQueries({ queryKey: ["workout-session"] });
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  // Auto-save on debounced changes
  useEffect(() => {
    if (debouncedWeight !== set.weight) {
      updateMutation.mutate({ weight: debouncedWeight });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedWeight]);

  useEffect(() => {
    if (debouncedReps !== set.reps) {
      updateMutation.mutate({ reps: debouncedReps });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedReps]);

  useEffect(() => {
    if (debouncedRpe !== set.rpe) {
      updateMutation.mutate({ rpe: debouncedRpe });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedRpe]);

  const currentVolume = setVolume({ weight, reps });
  const isPR = currentVolume > 0 && currentVolume > previousBestVolume;

  function toggleCompleted() {
    const next = !completed;
    setCompleted(next);
    updateMutation.mutate({ is_completed: next });
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[28px_1fr_1fr_70px_36px_28px] items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors",
        completed
          ? "border-success/30 bg-success/5"
          : "border-border bg-surface-2",
        isPR ? "ring-1 ring-primary/40" : "",
      )}
    >
      <span className="font-mono text-xs text-muted">#{set.set_number}</span>

      <Input
        type="number"
        value={weight || ""}
        onChange={(e) => setWeight(Number(e.target.value) || 0)}
        placeholder="kg"
        className="h-8 px-2 text-center font-mono text-sm"
      />
      <Input
        type="number"
        value={reps || ""}
        onChange={(e) => setReps(Number(e.target.value) || 0)}
        placeholder="reps"
        className="h-8 px-2 text-center font-mono text-sm"
      />
      <Input
        type="number"
        value={rpe || ""}
        onChange={(e) => setRpe(Number(e.target.value) || 0)}
        placeholder="RPE"
        className="h-8 px-2 text-center font-mono text-xs"
        min={0}
        max={10}
        step={0.5}
      />

      <button
        type="button"
        onClick={toggleCompleted}
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg transition-colors",
          completed
            ? "bg-success/20 text-success"
            : "border border-border text-muted hover:text-text",
        )}
        aria-label="Set complété"
      >
        {isPR ? <Trophy className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
      </button>

      <button
        type="button"
        onClick={() => deleteMutation.mutate()}
        className="text-muted hover:text-danger"
        aria-label="Supprimer le set"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
