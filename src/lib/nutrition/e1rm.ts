/**
 * e1RM combiné Epley + Brzycki (brief V3 phase 5).
 */

export type E1rmConfidence = "high" | "medium" | "low";

export function e1RMCombined(
  weight_kg: number,
  reps: number,
): { value: number; confidence: E1rmConfidence } {
  if (reps < 1) return { value: 0, confidence: "low" };
  if (reps === 1) return { value: weight_kg, confidence: "high" };

  const epley = weight_kg * (1 + reps / 30);
  const cappedReps = Math.min(reps, 36);
  const denominator = Math.max(1, 37 - cappedReps);
  const brzycki = (weight_kg * 36) / denominator;

  const avg = (epley + brzycki) / 2;
  const confidence: E1rmConfidence =
    reps <= 5 ? "high" : reps <= 10 ? "medium" : "low";
  return { value: Math.round(avg * 10) / 10, confidence };
}

export function volumeKg(sets: { weight_kg: number; reps: number }[]): number {
  return sets.reduce((acc, s) => acc + s.weight_kg * s.reps, 0);
}
