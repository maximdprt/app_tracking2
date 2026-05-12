import type { GoalType } from "@/types/domain";

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  intense: 1.725,
  veryIntense: 1.9,
} as const;

export const GOAL_DEFINITIONS: Record<
  GoalType,
  {
    label: string;
    description: string;
    deficit: number;
    icon: string;
    accent: string;
  }
> = {
  weight_loss: {
    label: "Perte de poids",
    description: "Déficit progressif pour sécher",
    deficit: -0.2,
    icon: "🔥",
    accent: "secondary",
  },
  recomposition: {
    label: "Recomposition",
    description: "Perdre du gras et gagner du muscle",
    deficit: -0.1,
    icon: "⚖️",
    accent: "info",
  },
  maintenance: {
    label: "Maintien",
    description: "Stabiliser performance et énergie",
    deficit: 0,
    icon: "🎯",
    accent: "text",
  },
  muscle_gain: {
    label: "Prise de muscle",
    description: "Surplus contrôlé orienté volume",
    deficit: 0.1,
    icon: "💪",
    accent: "primary",
  },
  performance: {
    label: "Performance",
    description: "Maximiser force et récupération",
    deficit: 0.15,
    icon: "⚡",
    accent: "warning",
  },
};

export const PROTEIN_PER_KG = 2;
export const FAT_KCAL_RATIO = 0.25;
