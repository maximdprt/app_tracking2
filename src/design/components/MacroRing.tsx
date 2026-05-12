"use client";

import { ProgressRing } from "@/components/shared/ProgressRing";

export interface MacroRingProps {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

/** Trois anneaux P / G / L + kcal comme ring principal. */
export function MacroRing({ totals, targets }: MacroRingProps) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-6 lg:justify-between">
      <div className="flex flex-col items-center">
        <ProgressRing
          value={Math.min(totals.calories, targets.calories * 1.2)}
          max={targets.calories || 1}
          size={148}
          stroke={12}
          color="var(--lift-macro-kcal)"
          trackColor="color-mix(in srgb, var(--lift-text-primary) 8%, transparent)"
          label={`${Math.round(totals.calories)}`}
          sublabel="kcal"
        />
      </div>
      <div className="flex gap-6">
        <ProgressRing
          value={totals.protein}
          max={targets.protein || 1}
          size={92}
          stroke={9}
          color="var(--lift-macro-protein)"
          trackColor="color-mix(in srgb, var(--lift-text-primary) 7%, transparent)"
          label={`${Math.round(totals.protein)}`}
          sublabel="P"
        />
        <ProgressRing
          value={totals.carbs}
          max={targets.carbs || 1}
          size={92}
          stroke={9}
          color="var(--lift-macro-carbs)"
          trackColor="color-mix(in srgb, var(--lift-text-primary) 7%, transparent)"
          label={`${Math.round(totals.carbs)}`}
          sublabel="G"
        />
        <ProgressRing
          value={totals.fats}
          max={targets.fats || 1}
          size={92}
          stroke={9}
          color="var(--lift-macro-fats)"
          trackColor="color-mix(in srgb, var(--lift-text-primary) 7%, transparent)"
          label={`${Math.round(totals.fats)}`}
          sublabel="L"
        />
      </div>
    </div>
  );
}
