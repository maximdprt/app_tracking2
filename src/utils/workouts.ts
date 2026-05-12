import type { ExerciseSet } from "@/types/domain";

export function setVolume(set: { weight: number | null; reps: number | null }): number {
  if (set.weight === null || set.reps === null) return 0;
  return set.weight * set.reps;
}

export function totalVolume(sets: Pick<ExerciseSet, "weight" | "reps">[]): number {
  return sets.reduce((acc, s) => acc + setVolume(s), 0);
}

export function maxOneRepMax(sets: Pick<ExerciseSet, "weight" | "reps">[]): number {
  // Epley: 1RM = w * (1 + r/30)
  return sets.reduce((max, s) => {
    if (s.weight === null || s.reps === null || s.reps === 0) return max;
    const est = s.weight * (1 + s.reps / 30);
    return est > max ? est : max;
  }, 0);
}

export function isPR(
  current: { weight: number | null; reps: number | null },
  previousBest: number,
): boolean {
  if (current.weight === null || current.reps === null) return false;
  return setVolume(current) > previousBest;
}
