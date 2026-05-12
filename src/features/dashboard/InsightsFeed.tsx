"use client";

import { useMemo } from "react";
import { AlertCircle, CheckCircle2, Info, Flame, TrendingUp, Moon, Footprints, Dumbbell } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type InsightSeverity = "success" | "warning" | "info" | "tip";

export interface Insight {
  id: string;
  severity: InsightSeverity;
  icon: LucideIcon;
  title: string;
  detail?: string;
}

interface Props {
  totals: { calories: number; protein: number; carbs: number; fats: number };
  targets: { calories: number; protein: number; carbs: number; fats: number };
  sessionsThisWeek: number;
  sleepHours: number | null;
  steps: number | null;
  weightTrend: number | null; // kg over last 30 days
  streakFood: number;
  streakWorkout: number;
}

const SEVERITY_STYLES: Record<InsightSeverity, { bg: string; text: string; border: string }> = {
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  tip: {
    bg: "bg-surface-2",
    text: "text-text-soft",
    border: "border-border",
  },
};

const SEVERITY_ICON: Record<InsightSeverity, LucideIcon> = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
  tip: Info,
};

function useInsights({
  totals,
  targets,
  sessionsThisWeek,
  sleepHours,
  steps,
  weightTrend,
  streakFood,
  streakWorkout,
}: Props): Insight[] {
  return useMemo(() => {
    const insights: Insight[] = [];
    const id = () => Math.random().toString(36).slice(2);

    // ─── Calories ────────────────────────────────────────────────────────────
    if (targets.calories > 0) {
      const remaining = targets.calories - totals.calories;
      const pct = totals.calories / targets.calories;

      if (pct >= 0.9 && pct <= 1.05) {
        insights.push({
          id: id(),
          severity: "success",
          icon: Flame,
          title: "Objectif calories presque atteint",
          detail: `${Math.round(totals.calories)} / ${targets.calories} kcal. Super discipline !`,
        });
      } else if (pct > 1.1) {
        insights.push({
          id: id(),
          severity: "warning",
          icon: Flame,
          title: "Dépassement calorique",
          detail: `+${Math.abs(Math.round(remaining))} kcal au-dessus de l'objectif. Ajuste ton prochain repas.`,
        });
      } else if (totals.calories < 200 && targets.calories > 0) {
        insights.push({
          id: id(),
          severity: "info",
          icon: Flame,
          title: "Aucun repas logué aujourd'hui",
          detail: "Pense à logger tes repas pour un suivi précis.",
        });
      }
    }

    // ─── Protéines ───────────────────────────────────────────────────────────
    if (targets.protein > 0 && totals.calories > 300) {
      const protPct = totals.protein / targets.protein;
      if (protPct < 0.7) {
        insights.push({
          id: id(),
          severity: "warning",
          icon: TrendingUp,
          title: "Apport en protéines insuffisant",
          detail: `${Math.round(totals.protein)}g / ${targets.protein}g. Ajoute une source protéique.`,
        });
      } else if (protPct >= 0.95) {
        insights.push({
          id: id(),
          severity: "success",
          icon: TrendingUp,
          title: "Objectif protéines atteint",
          detail: `${Math.round(totals.protein)}g — tes muscles te remercient.`,
        });
      }
    }

    // ─── Séances ─────────────────────────────────────────────────────────────
    if (sessionsThisWeek >= 3) {
      insights.push({
        id: id(),
        severity: "success",
        icon: Dumbbell,
        title: `${sessionsThisWeek} séances cette semaine`,
        detail: "Belle régularité. Pense à intégrer un jour de récup actif.",
      });
    } else if (sessionsThisWeek === 0) {
      insights.push({
        id: id(),
        severity: "tip",
        icon: Dumbbell,
        title: "Aucune séance cette semaine",
        detail: "Même 20 minutes de mobilité comptent. Lance-toi !",
      });
    }

    // ─── Sommeil ─────────────────────────────────────────────────────────────
    if (sleepHours !== null) {
      if (sleepHours < 6) {
        insights.push({
          id: id(),
          severity: "warning",
          icon: Moon,
          title: "Sommeil insuffisant",
          detail: `${sleepHours}h — En dessous de 7h, la récupération et les gains sont impactés.`,
        });
      } else if (sleepHours >= 7 && sleepHours <= 9) {
        insights.push({
          id: id(),
          severity: "success",
          icon: Moon,
          title: `${sleepHours}h de sommeil`,
          detail: "Excellente fenêtre de récupération.",
        });
      }
    }

    // ─── Pas ─────────────────────────────────────────────────────────────────
    if (steps !== null && steps < 5000) {
      insights.push({
        id: id(),
        severity: "tip",
        icon: Footprints,
        title: "Activité légère aujourd'hui",
        detail: `${steps.toLocaleString("fr-FR")} pas. Vise 7 000+ pour le NEAT.`,
      });
    }

    // ─── Tendance poids ───────────────────────────────────────────────────────
    if (weightTrend !== null && Math.abs(weightTrend) >= 0.5) {
      const gaining = weightTrend > 0;
      insights.push({
        id: id(),
        severity: gaining ? "info" : "info",
        icon: TrendingUp,
        title: gaining ? `+${weightTrend}kg en 30j` : `${weightTrend}kg en 30j`,
        detail: gaining
          ? "Tendance à la hausse. Cohérent si ton objectif est la prise de masse."
          : "Tendance à la baisse. Cohérent si ton objectif est la perte de poids.",
      });
    }

    // ─── Streaks ─────────────────────────────────────────────────────────────
    if (streakFood >= 7) {
      insights.push({
        id: id(),
        severity: "success",
        icon: Flame,
        title: `🔥 ${streakFood} jours de log consécutifs !`,
        detail: "La constance est la clé. Continue !",
      });
    }
    if (streakWorkout >= 5) {
      insights.push({
        id: id(),
        severity: "success",
        icon: Dumbbell,
        title: `${streakWorkout} séances consécutives`,
        detail: "Tu bâtis une habitude solide.",
      });
    }

    // Limiter à 4 insights max pour ne pas surcharger
    return insights.slice(0, 4);
  }, [totals, targets, sessionsThisWeek, sleepHours, steps, weightTrend, streakFood, streakWorkout]);
}

export function InsightsFeed(props: Props) {
  const insights = useInsights(props);

  if (insights.length === 0) return null;

  return (
    <div className="space-y-2">
      {insights.map((insight) => {
        const style = SEVERITY_STYLES[insight.severity];
        const SeverityIcon = SEVERITY_ICON[insight.severity];
        return (
          <div
            key={insight.id}
            className={`flex items-start gap-3 rounded-xl border p-3 ${style.bg} ${style.border}`}
          >
            <div className={`mt-0.5 shrink-0 ${style.text}`}>
              <insight.icon className="h-4 w-4" />
            </div>
            <div>
              <p className={`text-sm font-medium ${style.text}`}>{insight.title}</p>
              {insight.detail ? (
                <p className="mt-0.5 text-[11px] text-text-soft">{insight.detail}</p>
              ) : null}
            </div>
            <div className={`ml-auto mt-0.5 shrink-0 ${style.text} opacity-50`}>
              <SeverityIcon className="h-3.5 w-3.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
