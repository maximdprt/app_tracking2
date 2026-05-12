import { describe, it, expect } from "vitest";
import {
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  activityLevelFromFrequency,
  estimateOneRepMax,
  isWeeklyLossTooAggressive,
  ACTIVITY_MULTIPLIERS,
  GOAL_CALORIE_ADJUSTMENT,
  PROTEIN_G_PER_KG,
} from "../calculations";

// ─── BMR ──────────────────────────────────────────────────────────────────────

describe("calculateBMR", () => {
  it("cas 1 — homme 30 ans, 80 kg, 180 cm → ~1880 kcal", () => {
    // Mifflin: 10*80 + 6.25*180 - 5*30 + 5 = 800+1125-150+5 = 1780
    const bmr = calculateBMR({ weight_kg: 80, height_cm: 180, age_years: 30, sex: "male" });
    expect(bmr).toBe(1780);
  });

  it("cas 2 — femme 25 ans, 60 kg, 165 cm → ~1400 kcal", () => {
    // Mifflin: 10*60 + 6.25*165 - 5*25 - 161 = 600+1031.25-125-161 = 1345.25 → 1345
    const bmr = calculateBMR({ weight_kg: 60, height_cm: 165, age_years: 25, sex: "female" });
    expect(bmr).toBe(1345);
  });

  it("cas 3 — homme très lourd 120 kg, 190 cm, 40 ans", () => {
    // 10*120 + 6.25*190 - 5*40 + 5 = 1200+1187.5-200+5 = 2192.5 → 2193
    const bmr = calculateBMR({ weight_kg: 120, height_cm: 190, age_years: 40, sex: "male" });
    expect(bmr).toBe(2193);
  });

  it("cas 4 — femme légère 45 kg, 155 cm, 50 ans", () => {
    // 10*45 + 6.25*155 - 5*50 - 161 = 450+968.75-250-161 = 1007.75 → 1008
    const bmr = calculateBMR({ weight_kg: 45, height_cm: 155, age_years: 50, sex: "female" });
    expect(bmr).toBe(1008);
  });

  it("lève une erreur si le poids est 0", () => {
    expect(() =>
      calculateBMR({ weight_kg: 0, height_cm: 170, age_years: 25, sex: "male" }),
    ).toThrow(RangeError);
  });
});

// ─── TDEE ─────────────────────────────────────────────────────────────────────

describe("calculateTDEE", () => {
  it("homme sédentaire → BMR × 1.2", () => {
    const bmr = 1780;
    const tdee = calculateTDEE(bmr, "sedentary");
    expect(tdee).toBe(Math.round(bmr * ACTIVITY_MULTIPLIERS.sedentary));
    expect(tdee).toBe(2136);
  });

  it("femme active (intense) → BMR × 1.725", () => {
    const bmr = 1345;
    const tdee = calculateTDEE(bmr, "intense");
    expect(tdee).toBe(Math.round(bmr * ACTIVITY_MULTIPLIERS.intense));
  });

  it("lève une erreur si BMR ≤ 0", () => {
    expect(() => calculateTDEE(0, "moderate")).toThrow(RangeError);
  });
});

// ─── Macros ───────────────────────────────────────────────────────────────────

describe("calculateMacros", () => {
  it("cas 1 — femme sédentaire weight_loss : calories en déficit, protéines élevées", () => {
    const bmr = calculateBMR({ weight_kg: 60, height_cm: 165, age_years: 25, sex: "female" });
    const tdee = calculateTDEE(bmr, "sedentary");
    const m = calculateMacros({ tdee, weight_kg: 60, goal: "weight_loss" });

    const expectedKcal = Math.round(tdee * (1 + GOAL_CALORIE_ADJUSTMENT.weight_loss));
    expect(m.targetCalories).toBe(expectedKcal);

    // Protéines = 60 * 2.2 = 132 g
    expect(m.protein).toBe(Math.round(60 * PROTEIN_G_PER_KG.weight_loss));

    // Les calories doivent être ≈ protein*4 + carbs*4 + fat*9 (±1 kcal d'arrondi)
    const reconstructed = m.protein * 4 + m.carbs * 4 + m.fats * 9;
    expect(Math.abs(reconstructed - m.targetCalories)).toBeLessThanOrEqual(20);

    // Fibres : 14g / 1000 kcal
    expect(m.fiber).toBe(Math.round((m.targetCalories / 1000) * 14));
  });

  it("cas 2 — homme actif muscle_gain : surplus calorique, protéines modérées", () => {
    const bmr = calculateBMR({ weight_kg: 80, height_cm: 180, age_years: 30, sex: "male" });
    const tdee = calculateTDEE(bmr, "intense");
    const m = calculateMacros({ tdee, weight_kg: 80, goal: "muscle_gain" });

    const expectedKcal = Math.round(tdee * (1 + GOAL_CALORIE_ADJUSTMENT.muscle_gain));
    expect(m.targetCalories).toBe(expectedKcal);
    expect(m.targetCalories).toBeGreaterThan(tdee); // surplus

    expect(m.protein).toBe(Math.round(80 * PROTEIN_G_PER_KG.muscle_gain));
    expect(m.carbs).toBeGreaterThan(0);
    expect(m.fats).toBeGreaterThan(0);
  });

  it("cas 3 — diet_preference keto : lipides >> glucides", () => {
    const tdee = 2500;
    const mKeto = calculateMacros({ tdee, weight_kg: 75, goal: "maintenance", diet_preference: "keto" });
    const mBalanced = calculateMacros({ tdee, weight_kg: 75, goal: "maintenance", diet_preference: "balanced" });

    // Keto : ~70% lipides
    expect(mKeto.fats).toBeGreaterThan(mBalanced.fats);
    expect(mKeto.carbs).toBeLessThan(mBalanced.carbs);
  });

  it("cas 4 — les glucides ne peuvent pas être négatifs (edge case keto + protéines élevées)", () => {
    const tdee = 1500;
    const m = calculateMacros({ tdee, weight_kg: 100, goal: "weight_loss", diet_preference: "keto" });
    expect(m.carbs).toBeGreaterThanOrEqual(0);
  });

  it("cas 5 — maintenance homme 75 kg veryIntense : calories ≈ TDEE", () => {
    const bmr = calculateBMR({ weight_kg: 75, height_cm: 175, age_years: 28, sex: "male" });
    const tdee = calculateTDEE(bmr, "veryIntense");
    const m = calculateMacros({ tdee, weight_kg: 75, goal: "maintenance" });
    expect(m.targetCalories).toBe(tdee);
  });

  it("lève une erreur si TDEE ≤ 0", () => {
    expect(() => calculateMacros({ tdee: 0, weight_kg: 70, goal: "maintenance" })).toThrow(
      RangeError,
    );
  });
});

// ─── activityLevelFromFrequency ───────────────────────────────────────────────

describe("activityLevelFromFrequency", () => {
  it("0 séance → sedentary", () => expect(activityLevelFromFrequency(0)).toBe("sedentary"));
  it("3 séances → light", () => expect(activityLevelFromFrequency(3)).toBe("light"));
  it("5 séances → moderate", () => expect(activityLevelFromFrequency(5)).toBe("moderate"));
  it("6 séances → intense", () => expect(activityLevelFromFrequency(6)).toBe("intense"));
  it("7 séances → veryIntense", () => expect(activityLevelFromFrequency(7)).toBe("veryIntense"));
});

// ─── 1RM ──────────────────────────────────────────────────────────────────────

describe("estimateOneRepMax", () => {
  it("1 rep = le poids utilisé", () => expect(estimateOneRepMax(100, 1)).toBe(100));
  it("bench 80 kg × 10 reps → 107 kg e1RM (Epley)", () => {
    // 80 × (1 + 10/30) = 80 × 1.333 = 106.67 → 107
    expect(estimateOneRepMax(80, 10)).toBe(107);
  });
  it("lève une erreur si reps > 30", () => {
    expect(() => estimateOneRepMax(60, 31)).toThrow(RangeError);
  });
});

// ─── Alerte perte agressive ───────────────────────────────────────────────────

describe("isWeeklyLossTooAggressive", () => {
  it("perte 0.5 kg/sem → false (dans la norme)", () =>
    expect(isWeeklyLossTooAggressive(80, 78, 4)).toBe(false)); // 2 kg / 4 sem = 0.5/sem

  it("perte 1 kg/sem → true (trop agressif)", () =>
    expect(isWeeklyLossTooAggressive(80, 72, 8)).toBe(true)); // 8 kg / 8 sem = 1/sem

  it("weight gain (prise de masse) → false", () =>
    expect(isWeeklyLossTooAggressive(75, 78, 4)).toBe(false));
});
