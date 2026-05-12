/** Log d'habitude pour calculs streak / compliance (valeur 0..2). */
export interface HabitMetricLog {
  habit_id: string;
  /** ISO yyyy-MM-dd */
  log_date: string;
  value: number | null | undefined;
}

export interface HabitMatrixDef {
  id: string;
}

/**
 * % de conformité sur un ensemble de logs (valeur plafonnée à 1).
 */
export function habitCompliance(
  logs: HabitMetricLog[],
  offDays: string[],
): number {
  const valid = logs.filter((l) => !offDays.includes(l.log_date));
  if (valid.length === 0) return 0;
  const sum = valid.reduce(
    (acc, l) => acc + Math.min(Math.max(Number(l.value ?? 0), 0), 1),
    0,
  );
  return Math.round((sum / valid.length) * 10000) / 100;
}

/** Score V3 agrégé : moyenne des % par habitude pour la même fenêtre dates. */
export function weeklyScore(
  habits: HabitMatrixDef[],
  logs: HabitMetricLog[],
  offDays: string[],
): number {
  if (habits.length === 0) return 0;

  const scores = habits.map((h) =>
    habitCompliance(logs.filter((l) => l.habit_id === h.id), offDays),
  );
  const total = scores.reduce((a, b) => a + b, 0);
  return Math.round((total / habits.length) * 100) / 100;
}

/** Jours consécutifs avec value >= 1 en remontant depuis `startDateISO`. */
export function currentStreak(
  habitId: string,
  logs: HabitMetricLog[],
  startDateISO: string,
): number {
  const byDate = new Map(
    logs
      .filter((l) => l.habit_id === habitId)
      .map((l) => [l.log_date, Number(l.value ?? 0)] as const),
  );

  let streak = 0;
  let cursor = new Date(`${startDateISO}T12:00:00Z`);

  for (let i = 0; i < 730; i += 1) {
    const key = cursor.toISOString().slice(0, 10);
    const v = byDate.get(key) ?? 0;
    if (v < 1) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
