"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { createClient } from "@/services/supabase/client";
import { getProfile, upsertProfile } from "@/services/supabase/queries/profile";
import { GoalType, OnboardingFormValues, Sex } from "@/types/domain";
import {
  calculateActivityLevel,
  calculateBMR,
  calculateMacros,
  calculateTDEE,
} from "@/utils/nutrition";
import { toUserMessage } from "@/lib/errors";

const GOALS: { id: GoalType; label: string }[] = [
  { id: "weight_loss", label: "Perte de poids" },
  { id: "recomposition", label: "Recomposition" },
  { id: "maintenance", label: "Maintien" },
  { id: "muscle_gain", label: "Prise de muscle" },
  { id: "performance", label: "Performance" },
];

export default function ProfilePage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<OnboardingFormValues>({
    sex: "male",
    age: 26,
    height: 175,
    weight: 75,
    trainingFrequency: 4,
    averageSteps: 8000,
    averageSleepHours: 7,
    goalType: "maintenance",
    goalDurationWeeks: 12,
  });

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        setEmail(user.email ?? "");
        const profile = await getProfile(supabase, user.id);
        if (!profile) return;
        setValues({
          sex: (profile.sex as Sex | null) ?? "male",
          age: profile.age ?? 26,
          height: profile.height ?? 175,
          weight: profile.weight ?? 75,
          trainingFrequency: profile.training_frequency ?? 4,
          averageSteps: profile.average_steps ?? 8000,
          averageSleepHours: profile.average_sleep_hours ?? 7,
          goalType: (profile.goal_type as GoalType | null) ?? "maintenance",
          goalDurationWeeks: profile.goal_duration_weeks ?? 12,
        });
      } catch (error: unknown) {
        toast.error(toUserMessage(error));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [supabase]);

  const macroResult = useMemo(() => {
    const bmr = calculateBMR(values.weight, values.height, values.age, values.sex);
    const tdee = calculateTDEE(bmr, calculateActivityLevel(values.trainingFrequency));
    return calculateMacros(tdee, values.goalType, values.weight);
  }, [values]);

  async function saveProfile(nextValues: OnboardingFormValues, showToast = false) {
    if (!userId) return;
    try {
      const bmr = calculateBMR(
        nextValues.weight,
        nextValues.height,
        nextValues.age,
        nextValues.sex,
      );
      const tdee = calculateTDEE(bmr, calculateActivityLevel(nextValues.trainingFrequency));
      const macros = calculateMacros(tdee, nextValues.goalType, nextValues.weight);
      await upsertProfile(supabase, {
        user_id: userId,
        sex: nextValues.sex,
        age: nextValues.age,
        height: nextValues.height,
        weight: nextValues.weight,
        training_frequency: nextValues.trainingFrequency,
        average_steps: nextValues.averageSteps,
        average_sleep_hours: nextValues.averageSleepHours,
        goal_type: nextValues.goalType,
        goal_duration_weeks: nextValues.goalDurationWeeks,
        current_daily_calories: tdee,
        target_daily_calories: macros.targetCalories,
        target_protein: macros.protein,
        target_carbs: macros.carbs,
        target_fats: macros.fats,
        experience_level: nextValues.trainingFrequency >= 5 ? "intermediate" : "beginner",
      });
      if (showToast) toast.success("Profil mis a jour");
    } catch (error: unknown) {
      toast.error(toUserMessage(error));
    }
  }

  function updateAndSave<K extends keyof OnboardingFormValues>(
    key: K,
    value: OnboardingFormValues[K],
  ) {
    const next = { ...values, [key]: value };
    setValues(next);
    void saveProfile(next);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return <PageHeader title="Profil" subtitle="Chargement..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profil" subtitle="Parametres et objectifs" />

      <Card>
        <p className="text-text-soft text-sm">Identite</p>
        <p className="mt-2 text-lg font-semibold">{email}</p>
      </Card>

      <Card className="space-y-4">
        <p className="text-text-soft text-sm">Mensurations</p>
        <Field label="Age" value={values.age} onChange={(v) => updateAndSave("age", v)} />
        <Field
          label="Taille (cm)"
          value={values.height}
          onChange={(v) => updateAndSave("height", v)}
        />
        <Field
          label="Poids (kg)"
          value={values.weight}
          onChange={(v) => updateAndSave("weight", v)}
        />
      </Card>

      <Card className="space-y-4">
        <p className="text-text-soft text-sm">Objectif</p>
        <div className="grid gap-2 md:grid-cols-3">
          {GOALS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              className={`rounded-xl border p-3 text-left ${values.goalType === goal.id ? "border-primary bg-primary-soft" : "border-border bg-surface-2"}`}
              onClick={() => updateAndSave("goalType", goal.id)}
            >
              {goal.label}
            </button>
          ))}
        </div>
        <Field
          label="Frequence entrainement / semaine"
          value={values.trainingFrequency}
          onChange={(v) => updateAndSave("trainingFrequency", v)}
        />
        <Field
          label="Sommeil moyen (h)"
          value={values.averageSleepHours}
          step={0.5}
          onChange={(v) => updateAndSave("averageSleepHours", v)}
        />
        <Field
          label="Pas moyens / jour"
          value={values.averageSteps}
          onChange={(v) => updateAndSave("averageSteps", v)}
        />
      </Card>

      <Card>
        <p className="text-text-soft text-sm">Macros calcules automatiquement</p>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <MacroBadge label="Calories" value={String(macroResult.targetCalories)} />
          <MacroBadge label="Proteines" value={`${macroResult.protein} g`} />
          <MacroBadge label="Glucides" value={`${macroResult.carbs} g`} />
          <MacroBadge label="Lipides" value={`${macroResult.fats} g`} />
        </div>
        <Button className="mt-4" onClick={() => void saveProfile(values, true)}>
          Recalculer mes objectifs
        </Button>
      </Card>

      <Card className="space-y-3">
        <p className="text-text-soft text-sm">Compte</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void logout()}>
            Deconnexion
          </Button>
          <ConfirmDialog
            title="Supprimer le compte"
            description="Action irreversible. Cette version V1 ne supprime pas encore en base."
            confirmLabel="Supprimer"
            onConfirm={() => {
              toast.info("Suppression complete arrive en V1.1");
            }}
            trigger={<Button variant="danger">Supprimer compte</Button>}
          />
        </div>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function MacroBadge({ label, value }: { label: string; value: string }) {
  return (
    <Badge className="justify-center py-2">
      <span className="text-text-soft mr-2">{label}:</span>
      <span className="text-text font-semibold">{value}</span>
    </Badge>
  );
}
