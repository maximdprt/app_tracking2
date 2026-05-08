export function calculateSetVolume(weight: number, reps: number): number {
  return weight * reps;
}

export function formatWorkoutStatus(status: "planned" | "completed" | "skipped"): string {
  if (status === "completed") return "Terminee";
  if (status === "skipped") return "Sautee";
  return "Planifiee";
}
