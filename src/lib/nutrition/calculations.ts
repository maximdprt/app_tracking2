/**
 * Calculs nutritionnels scientifiques — module canonique.
 * Source: Mifflin-St Jeor (1990), Katch (2018), Morton (2018), IOM fiber guidelines.
 * TOUTES les fonctions de l'app doivent importer depuis ce fichier.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Sex = "male" | "female";

/** Goals stockés en base. Ne pas renommer sans migration. */
export type GoalType =
  | "weight_loss"
  | "recomposition"
  | "maintenance"
  | "muscle_gain"
  | "performance";

export type DietPreference = "balanced" | "low_carb" | "high_carb" | "keto";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "intense" | "veryIntense";

export interface MacroTargets {
  targetCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

// ─── Constantes calibrées ─────────────────────────────────────────────────────

/**
 * Multiplicateurs TDEE (Ainsworth 2011 / Katch 2011).
 * Ne pas dépasser 1.9 sauf athlètes professionnels + travail manuel.
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,     // Travail bureau, aucun sport
  light: 1.375,       // Sport léger 1–3×/semaine
  moderate: 1.55,     // Sport modéré 3–5×/semaine
  intense: 1.725,     // Sport intense 6–7×/semaine
  veryIntense: 1.9,   // Sport intense quotidien + travail physique
};

/**
 * Protéines cibles en g/kg selon l'objectif.
 * Méta-analyse Morton 2018 (BJSM) + contexte déficit/surplus.
 */
export const PROTEIN_G_PER_KG: Record<GoalType, number> = {
  weight_loss:   2.2,  // Déficit → plafond haut pour préserver la masse maigre
  recomposition: 2.0,  // Déficit modéré + stimulus hypertrophique
  maintenance:   1.8,  // Entretien, pas de stress catabolique particulier
  muscle_gain:   1.8,  // Surplus → les glucides supplémentaires épargnent les protéines
  performance:   2.0,  // Force + récupération, légèrement plus élevé qu'entretien
};

/**
 * Part des lipides dans les calories totales selon la préférence alimentaire.
 * Fourchette ANSES 35–40% + adaptations low-carb / keto.
 */
export const FAT_KCAL_RATIO: Record<DietPreference, number> = {
  balanced:  0.27,  // Équilibré, référence
  low_carb:  0.40,  // Faible glucides, haute graisse
  high_carb: 0.20,  // Sports d'endurance, charge glucidique
  keto:      0.70,  // Cétogène (<50g glucides nets/jour)
};

/**
 * Ajustement calorique par objectif (fraction du TDEE).
 * Déficit max -25% pour éviter la perte musculaire (Helms 2014).
 */
export const GOAL_CALORIE_ADJUSTMENT: Record<GoalType, number> = {
  weight_loss:   -0.15,  // -15% : perte progressive (0.3–0.5 kg/sem)
  recomposition: -0.08,  // -8%  : déficit modéré pour récomposition
  maintenance:    0.00,
  muscle_gain:   +0.10,  // +10% : prise propre (lean bulk)
  performance:   +0.12,  // +12% : surplus orienté force + récupération
};

// ─── Fonctions ────────────────────────────────────────────────────────────────

/**
 * Métabolisme de base via l'équation de Mifflin-St Jeor (1990).
 * Précision ±10% sur population générale, meilleure que Harris-Benedict (1919).
 */
export function calculateBMR(params: {
  weight_kg: number;
  height_cm: number;
  age_years: number;
  sex: Sex;
}): number {
  const { weight_kg, height_cm, age_years, sex } = params;
  if (weight_kg <= 0 || height_cm <= 0 || age_years <= 0) {
    throw new RangeError("Tous les paramètres doivent être > 0");
  }
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age_years;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

/** Dépense énergétique totale journalière. */
export function calculateTDEE(bmr: number, level: ActivityLevel): number {
  if (bmr <= 0) throw new RangeError("Le BMR doit être > 0");
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[level]);
}

/**
 * Déduit un niveau d'activité à partir de la fréquence d'entraînement hebdomadaire.
 * Utile pour l'onboarding. Préférer un choix explicite si possible.
 */
export function activityLevelFromFrequency(sessionsPerWeek: number): ActivityLevel {
  if (sessionsPerWeek <= 1) return "sedentary";
  if (sessionsPerWeek <= 3) return "light";
  if (sessionsPerWeek <= 5) return "moderate";
  if (sessionsPerWeek <= 6) return "intense";
  return "veryIntense";
}

/**
 * Calcule les macros cibles journalières.
 *
 * Ordre de priorité des macros :
 * 1. Protéines : goal-specific en g/kg (conservation musculaire)
 * 2. Lipides : % des calories cibles selon diet_preference (santé hormonale)
 * 3. Glucides : calories résiduelles (énergie + performance)
 * 4. Fibres : 14g / 1000 kcal (recommandation IOM 2005)
 */
export function calculateMacros(params: {
  tdee: number;
  weight_kg: number;
  goal: GoalType;
  diet_preference?: DietPreference;
}): MacroTargets {
  const { tdee, weight_kg, goal, diet_preference = "balanced" } = params;
  if (tdee <= 0) throw new RangeError("Le TDEE doit être > 0");
  if (weight_kg <= 0) throw new RangeError("Le poids doit être > 0");

  const targetCalories = Math.round(tdee * (1 + GOAL_CALORIE_ADJUSTMENT[goal]));

  const protein = Math.round(weight_kg * PROTEIN_G_PER_KG[goal]);
  const proteinKcal = protein * 4;

  const fatRatio = FAT_KCAL_RATIO[diet_preference];
  const fats = Math.round((targetCalories * fatRatio) / 9);
  const fatKcal = fats * 9;

  const carbsKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbs = Math.round(carbsKcal / 4);

  const fiber = Math.round((targetCalories / 1000) * 14);

  return { targetCalories, protein, carbs, fats, fiber };
}

// ─── Helpers sport ────────────────────────────────────────────────────────────

/**
 * Estimation du 1 Rep Max via la formule d'Epley (1985).
 * Valide pour des répétitions entre 1 et 10.
 * @param weight_kg — charge utilisée
 * @param reps      — répétitions réalisées
 */
export function estimateOneRepMax(weight_kg: number, reps: number): number {
  if (reps === 1) return weight_kg;
  if (reps < 1 || reps > 30) throw new RangeError("reps doit être compris entre 1 et 30");
  return Math.round(weight_kg * (1 + reps / 30));
}

/**
 * Alerte si la perte de poids hebdomadaire dépasse le seuil recommandé.
 * Au-delà de 0.75 kg/sem en déficit, risque élevé de perte musculaire.
 */
export function isWeeklyLossTooAggressive(
  startWeight_kg: number,
  currentWeight_kg: number,
  weeks: number,
): boolean {
  if (weeks <= 0) return false;
  const weeklyLoss = (startWeight_kg - currentWeight_kg) / weeks;
  return weeklyLoss > 0.75;
}
