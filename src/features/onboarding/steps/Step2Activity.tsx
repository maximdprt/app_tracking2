"use client";

import type { OnboardingFormValues } from "@/types/domain";
import { Slider } from "@/components/ui/Slider";
import { Label } from "@/components/ui/Label";

interface Props {
  values: OnboardingFormValues;
  update: <K extends keyof OnboardingFormValues>(key: K, value: OnboardingFormValues[K]) => void;
}

export function Step2Activity({ values, update }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Ton activité</h2>
        <p className="mt-1 text-sm text-text-soft">
          Ces données affinent les recommandations énergétiques.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Label>Fréquence d'entraînement par semaine</Label>
          <Slider
            value={values.trainingFrequency}
            onChange={(v) => update("trainingFrequency", v)}
            min={0}
            max={7}
            unit="jours/sem"
          />
        </div>

        <div>
          <Label>Pas moyens par jour</Label>
          <Slider
            value={values.averageSteps}
            onChange={(v) => update("averageSteps", v)}
            min={0}
            max={20000}
            step={500}
            unit="pas"
          />
        </div>

        <div>
          <Label>Sommeil moyen</Label>
          <Slider
            value={values.averageSleepHours}
            onChange={(v) => update("averageSleepHours", v)}
            min={3}
            max={12}
            step={0.5}
            unit="h/nuit"
          />
        </div>
      </div>
    </div>
  );
}
