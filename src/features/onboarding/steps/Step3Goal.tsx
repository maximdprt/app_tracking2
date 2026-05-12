"use client";

import type { GoalType, OnboardingFormValues } from "@/types/domain";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { Slider } from "@/components/ui/Slider";
import { Label } from "@/components/ui/Label";
import { GOAL_DEFINITIONS } from "@/constants/nutrition";

interface Props {
  values: OnboardingFormValues;
  update: <K extends keyof OnboardingFormValues>(key: K, value: OnboardingFormValues[K]) => void;
}

const GOAL_OPTIONS = (
  Object.entries(GOAL_DEFINITIONS) as [GoalType, (typeof GOAL_DEFINITIONS)[GoalType]][]
).map(([id, def]) => ({
  value: id,
  label: def.label,
  description: def.description,
  icon: def.icon,
}));

export function Step3Goal({ values, update }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Quel est ton objectif ?</h2>
        <p className="mt-1 text-sm text-text-soft">
          Tu pourras le changer à tout moment depuis ton profil.
        </p>
      </div>

      <div>
        <ToggleGroup<GoalType>
          value={values.goalType}
          onChange={(v) => update("goalType", v)}
          options={GOAL_OPTIONS}
          columns={1}
          size="lg"
        />
      </div>

      <div>
        <Label>Durée de l'objectif</Label>
        <Slider
          value={values.goalDurationWeeks}
          onChange={(v) => update("goalDurationWeeks", v)}
          min={4}
          max={52}
          unit="semaines"
        />
      </div>
    </div>
  );
}
