"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Step1Personal } from "@/features/onboarding/steps/Step1Personal";
import { Step2Activity } from "@/features/onboarding/steps/Step2Activity";
import { Step3Goal } from "@/features/onboarding/steps/Step3Goal";
import { Step4Recap } from "@/features/onboarding/steps/Step4Recap";
import {
  activitySchema,
  goalSchema,
  personalSchema,
} from "@/features/onboarding/schemas";
import type { OnboardingFormValues } from "@/types/domain";
import {
  calculateActivityLevel,
  calculateBMR,
  calculateMacros,
  calculateTDEE,
} from "@/utils/nutrition";
import { createClient } from "@/services/supabase/client";
import { upsertProfile } from "@/services/supabase/queries/profile";
import { AppError, toUserMessage } from "@/lib/errors";
import { ROUTES } from "@/constants/routes";
import { writeAnalyticsConsentFlag } from "@/lib/consent/analytics-consent";

const INITIAL: OnboardingFormValues = {
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

const TOTAL_STEPS = 4;

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<OnboardingFormValues>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);

  const bmr = calculateBMR(values.weight, values.height, values.age, values.sex);
  const tdee = calculateTDEE(bmr, calculateActivityLevel(values.trainingFrequency));
  const macros = useMemo(
    () => calculateMacros(tdee, values.goalType, values.weight),
    [tdee, values.goalType, values.weight],
  );

  function update<K extends keyof OnboardingFormValues>(key: K, value: OnboardingFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    if (step === 0) {
      const r = personalSchema.safeParse(values);
      if (!r.success) {
        toast.error(r.error.issues[0]?.message ?? "Champs invalides");
        return false;
      }
    } else if (step === 1) {
      const r = activitySchema.safeParse(values);
      if (!r.success) {
        toast.error(r.error.issues[0]?.message ?? "Champs invalides");
        return false;
      }
    } else if (step === 2) {
      const r = goalSchema.safeParse(values);
      if (!r.success) {
        toast.error(r.error.issues[0]?.message ?? "Champs invalides");
        return false;
      }
    }
    return true;
  }

  function next() {
    if (!validate()) return;
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  }

  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
    try {
      if (!termsAccepted) {
        toast.error("Tu dois accepter les conditions pour continuer.");
        return;
      }
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new AppError("AUTH", "Session invalide");

      await upsertProfile(supabase, {
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
        target_daily_calories: macros.targetCalories,
        target_protein: macros.protein,
        target_carbs: macros.carbs,
        target_fats: macros.fats,
        experience_level: values.trainingFrequency >= 5 ? "intermediate" : "beginner",
      });

      writeAnalyticsConsentFlag(analyticsOptIn);

      await supabase.from("consent_log").insert([
        { user_id: user.id, consent_type: "terms_lift_v3", granted: true },
        ...(analyticsOptIn
          ? [{ user_id: user.id, consent_type: "analytics_product", granted: true }]
          : []),
      ]);

      toast.success("Profil enregistré");
      router.replace(ROUTES.dashboard);
      router.refresh();
    } catch (err) {
      toast.error(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-6 py-8">
      <header className="mb-8 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            Étape {step + 1} sur {TOTAL_STEPS}
          </span>
          <span className="font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </header>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {step === 0 ? <Step1Personal values={values} update={update} /> : null}
            {step === 1 ? <Step2Activity values={values} update={update} /> : null}
            {step === 2 ? <Step3Goal values={values} update={update} /> : null}
            {step === 3 ? <Step4Recap values={values} macros={macros} tdee={tdee} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="mt-8 space-y-4">
        {step === TOTAL_STEPS - 1 ? (
          <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-4 text-sm">
            <label className="flex gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <span>
                J&apos;accepte les conditions Lift et comprends comment mes données sont traitées (RGPD).
              </span>
            </label>
            <label className="flex gap-3 text-text-soft">
              <input
                type="checkbox"
                checked={analyticsOptIn}
                onChange={(e) => setAnalyticsOptIn(e.target.checked)}
                className="mt-1 accent-primary"
              />
              <span>Je souhaite l&apos;aide au produit anonymisée (PostHog UE, optionnel).</span>
            </label>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <Button
            variant="ghost"
            onClick={prev}
            disabled={step === 0 || loading}
            className={step === 0 ? "invisible" : ""}
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>
          {step < TOTAL_STEPS - 1 ? (
            <Button onClick={next}>
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => void submit()} loading={loading} size="lg">
              Démarrer
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
