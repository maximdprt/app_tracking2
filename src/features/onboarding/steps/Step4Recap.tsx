"use client";

import type { OnboardingFormValues, MacroResult } from "@/types/domain";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { Card } from "@/components/ui/Card";
import { GOAL_DEFINITIONS } from "@/constants/nutrition";

interface Props {
  values: OnboardingFormValues;
  macros: MacroResult;
  tdee: number;
}

export function Step4Recap({ values, macros, tdee }: Props) {
  const goal = GOAL_DEFINITIONS[values.goalType] ?? GOAL_DEFINITIONS.maintenance;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-text sm:text-2xl">Voici ton plan</h2>
        <p className="mt-1 lift-body-sm text-text-soft">
          Calculs basés sur Mifflin-St Jeor + ton objectif{" "}
          <span className="text-[var(--lift-text-primary)]">{goal.label.toLowerCase()}</span>.
        </p>
      </div>

      <Card className="bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--lift-text-primary)_6%,transparent)_0%,transparent_50%)]">
        <div className="text-center">
          <p className="lift-label-sm text-muted">Objectif quotidien</p>
          <p className="mt-2 lift-display-lg text-text tracking-tight">
            <AnimatedNumber value={macros.targetCalories} />
          </p>
          <p className="lift-body-sm text-text-soft">
            kcal · TDEE estimé <span className="lift-num">{tdee}</span> kcal
          </p>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <MacroPanel label="Protéines" value={macros.protein} color="var(--color-protein)" />
        <MacroPanel label="Glucides" value={macros.carbs} color="var(--color-carbs)" />
        <MacroPanel label="Lipides" value={macros.fats} color="var(--color-fats)" />
      </div>
    </div>
  );
}

function MacroPanel({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <div className="flex flex-col items-center gap-2">
        <ProgressRing
          value={value}
          max={value || 1}
          color={color}
          size={80}
          stroke={6}
          showLabel={false}
        />
        <div className="text-center">
          <p className="lift-label-sm text-muted">{label}</p>
          <p className="lift-display-sm text-text">{Math.round(value)} g</p>
        </div>
      </div>
    </Card>
  );
}
