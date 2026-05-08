"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/services/supabase/client";
import { getProfile, upsertProfile } from "@/services/supabase/queries/profile";
import { AppError, toUserMessage } from "@/lib/errors";
import { GoalType, OnboardingFormValues, Sex } from "@/types/domain";
import {
  calculateActivityLevel,
  calculateBMR,
  calculateMacros,
  calculateTDEE,
} from "@/utils/nutrition";

const stepSchemas = [
  z.object({
    sex: z.enum(["male", "female"]),
    age: z.number().min(13).max(100),
    height: z.number().min(100).max(250),
    weight: z.number().min(30).max(300),
  }),
  z.object({
    trainingFrequency: z.number().min(1).max(7),
    averageSteps: z.number().min(1000).max(30000),
    averageSleepHours: z.number().min(4).max(12),
  }),
  z.object({
    goalType: z.enum(["weight_loss", "recomposition", "maintenance", "muscle_gain", "performance"]),
    goalDurationWeeks: z.number().min(4).max(52),
  }),
];

const GOALS: { id: GoalType; title: string; description: string }[] = [
  { id: "weight_loss", title: "Perte de poids", description: "Deficit progressif pour secher." },
  {
    id: "recomposition",
    title: "Recomposition",
    description: "Perdre du gras et gagner du muscle.",
  },
  { id: "maintenance", title: "Maintien", description: "Stabiliser performance et energie." },
  { id: "muscle_gain", title: "Prise de muscle", description: "Surplus controle orienté volume." },
  { id: "performance", title: "Performance", description: "Maximiser force et recup." },
];

const INITIAL_VALUES: OnboardingFormValues = {
  sex: "male",
  age: 26,
  height: 175,
  weight: 75,
  trainingFrequency: 4,
  averageSteps: 8000,
  averageSleepHours: 7,
  goalType: "maintenance",
  goalDurationWeeks: 12,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<OnboardingFormValues>(INITIAL_VALUES);

  const progress = ((step + 1) / 4) * 100;
  const bmr = calculateBMR(values.weight, values.height, values.age, values.sex);
  const tdee = calculateTDEE(bmr, calculateActivityLevel(values.trainingFrequency));
  const macroResult = calculateMacros(tdee, values.goalType, values.weight);

  function update<K extends keyof OnboardingFormValues>(key: K, value: OnboardingFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validateCurrentStep(): boolean {
    if (step > 2 || step >= stepSchemas.length) return true;
    const schema = stepSchemas[step];
    if (!schema) return false;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Champs invalides");
      return false;
    }
    return true;
  }

  async function submitOnboarding() {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new AppError("AUTH", "Session invalide");

      const existing = await getProfile(supabase, user.id);
      await upsertProfile(supabase, {
        ...(existing?.id ? { id: existing.id } : {}),
        user_id: user.id,
        sex: values.sex,
        age: values.age,
        height: values.height,
        weight: values.weight,
        training_frequency: values.trainingFrequency,
        average_steps: values.averageSteps,
        average_sleep_hours: values.averageSleepHours,
        goal_type: values.goalType,
        goal_duration_weeks: values.goalDurationWeeks,
        current_daily_calories: tdee,
        target_daily_calories: macroResult.targetCalories,
        target_protein: macroResult.protein,
        target_carbs: macroResult.carbs,
        target_fats: macroResult.fats,
        experience_level: values.trainingFrequency >= 5 ? "intermediate" : "beginner",
      });

      toast.success("Profil enregistre");
      router.replace("/dashboard");
    } catch (error: unknown) {
      toast.error(toUserMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const stepContent = useMemo(() => {
    if (step === 0) {
      return (
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">Infos personnelles</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["male", "female"] as Sex[]).map((sex) => (
              <button
                key={sex}
                type="button"
                className={`rounded-xl border p-4 text-left ${values.sex === sex ? "border-primary bg-primary-soft" : "border-border bg-surface"}`}
                onClick={() => update("sex", sex)}
              >
                {sex === "male" ? "Homme" : "Femme"}
              </button>
            ))}
          </div>
          <Field
            label="Age"
            value={values.age}
            min={13}
            max={100}
            onChange={(v) => update("age", v)}
          />
          <Field
            label="Taille (cm)"
            value={values.height}
            min={100}
            max={220}
            onChange={(v) => update("height", v)}
          />
          <Field
            label="Poids (kg)"
            value={values.weight}
            min={30}
            max={200}
            onChange={(v) => update("weight", v)}
          />
        </div>
      );
    }
    if (step === 1) {
      return (
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">Activite</h2>
          <Field
            label="Frequence entrainement / semaine"
            value={values.trainingFrequency}
            min={1}
            max={7}
            onChange={(v) => update("trainingFrequency", v)}
          />
          <Field
            label="Pas moyens / jour"
            value={values.averageSteps}
            min={1000}
            max={30000}
            step={500}
            onChange={(v) => update("averageSteps", v)}
          />
          <Field
            label="Sommeil moyen (heures)"
            value={values.averageSleepHours}
            min={4}
            max={12}
            step={0.5}
            onChange={(v) => update("averageSleepHours", v)}
          />
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="space-y-5">
          <h2 className="text-2xl font-semibold">Objectif</h2>
          <div className="grid gap-2">
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                type="button"
                className={`rounded-xl border p-4 text-left ${values.goalType === goal.id ? "border-primary bg-primary-soft" : "border-border bg-surface"}`}
                onClick={() => update("goalType", goal.id)}
              >
                <p className="font-medium">{goal.title}</p>
                <p className="text-text-soft mt-1 text-sm">{goal.description}</p>
              </button>
            ))}
          </div>
          <Field
            label="Duree objectif (semaines)"
            value={values.goalDurationWeeks}
            min={4}
            max={52}
            onChange={(v) => update("goalDurationWeeks", v)}
          />
        </div>
      );
    }
    return (
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold">Recap</h2>
        <Card className="bg-[linear-gradient(135deg,rgba(163,230,53,0.04)_0%,transparent_50%)]">
          <p className="text-text-soft text-sm">Calories cible</p>
          <p className="mt-2 text-5xl font-semibold tracking-tight">{macroResult.targetCalories}</p>
        </Card>
        <div className="grid gap-3 md:grid-cols-3">
          <MacroCard label="Proteines" value={`${macroResult.protein} g`} color="protein" />
          <MacroCard label="Glucides" value={`${macroResult.carbs} g`} color="carbs" />
          <MacroCard label="Lipides" value={`${macroResult.fats} g`} color="fats" />
        </div>
      </div>
    );
  }, [macroResult, step, values]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="bg-surface mb-6 h-1.5 overflow-hidden rounded-full">
        <div className="bg-primary h-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {stepContent}
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          disabled={step === 0 || loading}
          onClick={() => setStep((s) => s - 1)}
        >
          Retour
        </Button>
        {step < 3 ? (
          <Button
            onClick={() => {
              if (!validateCurrentStep()) return;
              setStep((s) => s + 1);
            }}
          >
            Continuer
          </Button>
        ) : (
          <Button loading={loading} onClick={submitOnboarding}>
            Demarrer
          </Button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  min,
  max,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          className="w-full accent-lime-400"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <Input
          className="w-24"
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
    </div>
  );
}

function MacroCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "protein" | "carbs" | "fats";
}) {
  const colorClass =
    color === "protein" ? "text-protein" : color === "carbs" ? "text-carbs" : "text-fats";
  return (
    <Card>
      <p className="text-text-soft text-sm">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${colorClass}`}>{value}</p>
    </Card>
  );
}
