export function calculateVolume(rows: { weight: number | null; reps: number | null }[]): number {
  return rows.reduce((acc, row) => acc + (row.weight ?? 0) * (row.reps ?? 0), 0);
}

export function detectPR(current: number, previousBest: number): boolean {
  return current > previousBest;
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return "0 min";
  return `${minutes} min`;
}
