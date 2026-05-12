import { describe, it, expect } from "vitest";
import { e1RMCombined, volumeKg } from "../e1rm";

describe("e1RMCombined", () => {
  it("1 rep = poids", () => {
    expect(e1RMCombined(100, 1)).toEqual({ value: 100, confidence: "high" });
  });

  it("répétitions médianes donnent valeur > charge", () => {
    const { value } = e1RMCombined(80, 8);
    expect(value).toBeGreaterThan(80);
    expect(value).toBeLessThan(120);
  });
});

describe("volumeKg", () => {
  it("somme série × reps × charge", () => {
    expect(
      volumeKg([
        { weight_kg: 60, reps: 5 },
        { weight_kg: 60, reps: 5 },
      ]),
    ).toBe(600);
  });
});
