"use client";

import type { OnboardingFormValues, Sex } from "@/types/domain";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { Slider } from "@/components/ui/Slider";
import { Label } from "@/components/ui/Label";

interface Props {
  values: OnboardingFormValues;
  update: <K extends keyof OnboardingFormValues>(key: K, value: OnboardingFormValues[K]) => void;
}

export function Step1Personal({ values, update }: Props) {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Faisons connaissance</h2>
        <p className="mt-1 text-sm text-text-soft">Ces infos servent à calculer tes besoins.</p>
      </div>

      <div className="space-y-5">
        <div>
          <Label>Sexe</Label>
          <ToggleGroup<Sex>
            value={values.sex}
            onChange={(v) => update("sex", v)}
            options={[
              { value: "male", label: "Homme", icon: "♂" },
              { value: "female", label: "Femme", icon: "♀" },
            ]}
            columns={2}
            size="lg"
          />
        </div>

        <div>
          <Label>Âge</Label>
          <Slider
            value={values.age}
            onChange={(v) => update("age", v)}
            min={13}
            max={100}
            unit="ans"
          />
        </div>

        <div>
          <Label>Taille</Label>
          <Slider
            value={values.height}
            onChange={(v) => update("height", v)}
            min={100}
            max={220}
            unit="cm"
          />
        </div>

        <div>
          <Label>Poids</Label>
          <Slider
            value={values.weight}
            onChange={(v) => update("weight", v)}
            min={30}
            max={200}
            unit="kg"
          />
        </div>
      </div>
    </div>
  );
}
