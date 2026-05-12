/** Proposition onboarding V3 — noms courts pour `habits.habit_name` + métadonnées UI. */

export interface DefaultHabitDef {
  readonly nom: string;
  readonly icon: string;
  readonly target: number;
  readonly unit: string;
}

export const DEFAULT_HABITS_V3: readonly DefaultHabitDef[] = [
  { nom: "Douche froide", icon: "ti-droplet", target: 1, unit: "fois" },
  { nom: "Étirements", icon: "ti-stretching", target: 1, unit: "fois" },
  { nom: "Skincare", icon: "ti-mask", target: 1, unit: "fois" },
  { nom: "Lecture 10 pages", icon: "ti-book", target: 10, unit: "pages" },
  { nom: "Méditation 10 min", icon: "ti-yoga", target: 10, unit: "min" },
  { nom: "1.5L d'eau", icon: "ti-glass-full", target: 1.5, unit: "litres" },
  { nom: "Faire son lit", icon: "ti-bed", target: 1, unit: "fois" },
  { nom: "Pas de réseaux le matin", icon: "ti-phone-off", target: 1, unit: "fois" },
] as const;
