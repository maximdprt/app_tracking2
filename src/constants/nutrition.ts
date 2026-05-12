/**
 * Constantes UI et étiquettes des goals — séparées du calcul pur.
 * Pour les formules scientifiques, voir src/lib/nutrition/calculations.ts.
 */
import type { GoalType } from "@/types/domain";
import {
  ACTIVITY_MULTIPLIERS,
  PROTEIN_G_PER_KG,
  FAT_KCAL_RATIO,
  GOAL_CALORIE_ADJUSTMENT,
} from "@/lib/nutrition/calculations";

// Ré-exporte pour éviter d'avoir à changer tous les imports existants
export { ACTIVITY_MULTIPLIERS, PROTEIN_G_PER_KG, FAT_KCAL_RATIO, GOAL_CALORIE_ADJUSTMENT };

/** Alias rétro-compatibilité (ancienne constante flat — à terme supprimer) */
export const PROTEIN_PER_KG = PROTEIN_G_PER_KG.maintenance;
/** Alias rétro-compatibilité */
export const FAT_KCAL_RATIO_DEFAULT = FAT_KCAL_RATIO.balanced;

export const GOAL_DEFINITIONS: Record<
  GoalType,
  {
    label: string;
    description: string;
    deficit: number;
    proteinPerKg: number;
    icon: string;
    accent: string;
  }
> = {
  weight_loss: {
    label: "Perte de poids",
    description: "Déficit progressif, haute protéine pour préserver le muscle",
    deficit: GOAL_CALORIE_ADJUSTMENT.weight_loss,
    proteinPerKg: PROTEIN_G_PER_KG.weight_loss,
    icon: "🔥",
    accent: "secondary",
  },
  recomposition: {
    label: "Recomposition",
    description: "Perdre du gras et gagner du muscle simultanément",
    deficit: GOAL_CALORIE_ADJUSTMENT.recomposition,
    proteinPerKg: PROTEIN_G_PER_KG.recomposition,
    icon: "⚖️",
    accent: "info",
  },
  maintenance: {
    label: "Maintien",
    description: "Stabiliser poids, performance et énergie",
    deficit: GOAL_CALORIE_ADJUSTMENT.maintenance,
    proteinPerKg: PROTEIN_G_PER_KG.maintenance,
    icon: "🎯",
    accent: "text",
  },
  muscle_gain: {
    label: "Prise de muscle",
    description: "Surplus contrôlé pour maximiser la synthèse protéique",
    deficit: GOAL_CALORIE_ADJUSTMENT.muscle_gain,
    proteinPerKg: PROTEIN_G_PER_KG.muscle_gain,
    icon: "💪",
    accent: "primary",
  },
  performance: {
    label: "Performance",
    description: "Maximiser force, récupération et composition",
    deficit: GOAL_CALORIE_ADJUSTMENT.performance,
    proteinPerKg: PROTEIN_G_PER_KG.performance,
    icon: "⚡",
    accent: "warning",
  },
};
