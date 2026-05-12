import { describe, it, expect } from "vitest";
import {
  calculateBMRV3,
  calculateMacrosV3,
  calculateTargetCaloriesV3,
  calculateTDEEv3,
} from "../v3-calculations";

describe("V3 macros", () => {
  it("BMR homme cohérent", () => {
    const bmr = calculateBMRV3({
      weight_kg: 80,
      height_cm: 180,
      age_years: 30,
      sex: "male",
    });
    expect(bmr).toBeCloseTo(1780, 0);
  });

  it("TDEE = BMR × multiplicateur", () => {
    const bmr = 2000;
    expect(calculateTDEEv3(bmr, "sedentary")).toBe(2400);
  });

  it("déficit cut", () => {
    const tdee = 2500;
    expect(calculateTargetCaloriesV3(tdee, "cut")).toBe(Math.round(tdee * 0.85));
  });

  it("macros positives", () => {
    const m = calculateMacrosV3({
      target_kcal: 2400,
      weight_kg: 75,
      goal: "maintain",
    });
    expect(m.proteins_g).toBeGreaterThan(0);
    expect(m.carbs_g).toBeGreaterThan(0);
    expect(m.fats_g).toBeGreaterThan(0);
  });
});
