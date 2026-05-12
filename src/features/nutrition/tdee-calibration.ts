/** Calibration TDEE théorie vs données réelles — web (persist `users_profiles` hors scope). */

export interface TdeeCalibrationInput {
  theoreticalTdee_kcal: number;
  /** intake moyen kcal / jour observé sur la fenêtre */
  avgIntakeKcalPerDay: number;
  /** delta poids en kg sur la même fenêtre (positif = prise de masse) */
  deltaWeightKg: number;
  /** durée fenêtre en jours */
  days: number;
}

/**
 * Approximation grossière : surplus/déficit ~7700 kcal / kg graisse équivalent.
 * Écart notable → facteur correction sur TDEE prédictif (plafonné ±15%).
 */
export function proposeCalibratedTdee(input: TdeeCalibrationInput): {
  calibrated: number;
  adjustmentPct: number;
  needsAttention: boolean;
} {
  const { theoreticalTdee_kcal, avgIntakeKcalPerDay, deltaWeightKg, days } =
    input;
  if (days <= 0 || theoreticalTdee_kcal <= 0)
    return { calibrated: theoreticalTdee_kcal, adjustmentPct: 0, needsAttention: false };

  /** kcal théorisées sous dépôt / dépôt relatif (~7700 kcal/kg) sur la fenêtre */
  const energyFromStoredFat = deltaWeightKg * (7700 / days);

  const impliedSpend = avgIntakeKcalPerDay - energyFromStoredFat;
  let factor = impliedSpend / theoreticalTdee_kcal;

  factor = Math.max(0.85, Math.min(1.15, factor));
  const calibrated = Math.round(theoreticalTdee_kcal * factor);
  const adjustmentPct = Math.round((factor - 1) * 1000) / 10;
  const needsAttention =
    Math.abs(adjustmentPct) >= 15 || factor === 0.85 || factor === 1.15;

  return { calibrated, adjustmentPct, needsAttention };
}
