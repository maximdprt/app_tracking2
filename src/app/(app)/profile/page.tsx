"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { Label } from "@/components/ui/Label";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  readAnalyticsConsentFlag,
  writeAnalyticsConsentFlag,
} from "@/lib/consent/analytics-consent";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { useUser } from "@/hooks/useUser";
import { useProfile } from "@/hooks/useProfile";
import { createClient } from "@/services/supabase/client";
import { upsertProfile } from "@/services/supabase/queries/profile";
import {
  calculateActivityLevel,
  calculateBMR,
  calculateMacros,
  calculateTDEE,
} from "@/utils/nutrition";
import { GOAL_DEFINITIONS } from "@/constants/nutrition";
import { ROUTES } from "@/constants/routes";
import { toUserMessage } from "@/lib/errors";
import type { GoalType, OnboardingFormValues, Sex } from "@/types/domain";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const profileQuery = useProfile();
  const profile = profileQuery.data;

  const [values, setValues] = useState<OnboardingFormValues | null>(null);
  const [allowAnalytics, setAllowAnalytics] = useState(false);

  useEffect(() => {
    setAllowAnalytics(readAnalyticsConsentFlag());
  }, []);

  useEffect(() => {
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
  }, [profile]);

  const macros = useMemo(() => {
    if (!values) return null;
    const bmr = calculateBMR(values.weight, values.height, values.age, values.sex);
    const tdee = calculateTDEE(bmr, calculateActivityLevel(values.trainingFrequency));
    return calculateMacros(tdee, values.goalType, values.weight);
  }, [values]);

  const saveMutation = useMutation({
    mutationFn: async (next: OnboardingFormValues) => {
      if (!user?.id) throw new Error("Unauthorized");
      const supabase = createClient();
      const bmr = calculateBMR(next.weight, next.height, next.age, next.sex);
      const tdee = calculateTDEE(bmr, calculateActivityLevel(next.trainingFrequency));
      const m = calculateMacros(tdee, next.goalType, next.weight);
      await upsertProfile(supabase, {
        user_id: user.id,
        sex: next.sex,
        age: next.age,
        height: next.height,
        weight: next.weight,
        training_frequency: next.trainingFrequency,
        average_steps: next.averageSteps,
        average_sleep_hours: next.averageSleepHours,
        goal_type: next.goalType,
        goal_duration_weeks: next.goalDurationWeeks,
        current_daily_calories: tdee,
        target_daily_calories: m.targetCalories,
        target_protein: m.protein,
        target_carbs: m.carbs,
        target_fats: m.fats,
        experience_level: next.trainingFrequency >= 5 ? "intermediate" : "beginner",
      });
    },
    onSuccess: () => {
      toast.success("Profil mis à jour");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  const purgeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/me/purge", { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Échec de la suppression des données.");
      }
    },
    onSuccess: async () => {
      toast.success("Données effacées.");
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace(ROUTES.login);
      router.refresh();
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  async function persistAnalyticsConsent(next: boolean) {
    if (!user?.id) return;
    writeAnalyticsConsentFlag(next);
    setAllowAnalytics(next);
    try {
      const sb = createClient();
      await sb.from("consent_log").insert({
        user_id: user.id,
        consent_type: "analytics_product",
        granted: next,
      });
      toast.success(
        next
          ? "Préférence enregistrée — la page recharge pour charger l’analytics."
          : "Analytics désactivées.",
      );
      if (next) window.location.reload();
    } catch (err) {
      toast.error(toUserMessage(err));
    }
  }

  async function downloadDataExport() {
    try {
      const res = await fetch("/api/me/export");
      if (!res.ok) throw new Error("Export indisponible");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ascend-export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export téléchargé");
    } catch (err) {
      toast.error(toUserMessage(err));
    }
  }

  function update<K extends keyof OnboardingFormValues>(key: K, value: OnboardingFormValues[K]) {
    if (!values) return;
    setValues({ ...values, [key]: value });
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace(ROUTES.login);
    router.refresh();
  }

  if (!values) {
    return (
      <div className="space-y-10">
        <PageHeader title="Profil" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHeader title="Profil" subtitle="Édite tes infos et objectifs." />

      {/* Identity */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar fallback={user?.email?.[0] ?? "?"} size="lg" />
          <div>
            <p className="lift-body-sm font-medium text-text">{user?.email ?? "Utilisateur"}</p>
            <p className="lift-body-sm text-muted">Compte créé via Supabase</p>
          </div>
        </div>
      </Card>

      {/* Mensurations */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Mensurations</CardTitle>
            <CardDescription>Modifications enregistrées au save.</CardDescription>
          </div>
        </CardHeader>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label>Sexe</Label>
            <ToggleGroup<Sex>
              value={values.sex}
              onChange={(v) => update("sex", v)}
              options={[
                { value: "male", label: "Homme" },
                { value: "female", label: "Femme" },
              ]}
              columns={2}
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
      </Card>

      {/* Goal */}
      <Card>
        <CardHeader>
          <CardTitle>Objectif</CardTitle>
        </CardHeader>
        <ToggleGroup<GoalType>
          value={values.goalType}
          onChange={(v) => update("goalType", v)}
          options={(
            Object.entries(GOAL_DEFINITIONS) as [GoalType, (typeof GOAL_DEFINITIONS)[GoalType]][]
          ).map(([id, def]) => ({
            value: id,
            label: def.label,
            icon: def.icon,
          }))}
          columns={5}
        />
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité</CardTitle>
        </CardHeader>
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <Label>Fréquence / semaine</Label>
            <Slider
              value={values.trainingFrequency}
              onChange={(v) => update("trainingFrequency", v)}
              min={0}
              max={7}
              unit="jours"
            />
          </div>
          <div>
            <Label>Pas / jour</Label>
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
              unit="h"
            />
          </div>
        </div>
      </Card>

      {/* Macros recap */}
      {macros ? (
        <Card className="bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--lift-text-primary)_6%,transparent)_0%,transparent_60%)]">
          <CardHeader>
            <div>
              <CardTitle>Objectifs calculés</CardTitle>
              <CardDescription>
                Mis à jour automatiquement quand tu changes tes infos.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="lift-body-sm text-muted">Calories</p>
              <p className="lift-display-md text-text tracking-tight">
                <AnimatedNumber value={macros.targetCalories} />
              </p>
              <p className="lift-body-sm text-muted">kcal/jour</p>
            </div>
            <MacroPanel label="Protéines" value={macros.protein} color="var(--color-protein)" />
            <MacroPanel label="Glucides" value={macros.carbs} color="var(--color-carbs)" />
            <MacroPanel label="Lipides" value={macros.fats} color="var(--color-fats)" />
          </div>

          <Button
            className="mt-6 w-full"
            onClick={() => saveMutation.mutate(values)}
            loading={saveMutation.isPending}
            size="lg"
          >
            Enregistrer mes objectifs
          </Button>
        </Card>
      ) : null}

      {/* Confidentialité */}
      <Card>
        <CardHeader>
          <CardTitle>Confidentialité</CardTitle>
          <CardDescription>Thème, export RGPD et télémétrie optionnelle.</CardDescription>
        </CardHeader>
        <div className="space-y-5 px-6 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
          </div>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 accent-primary"
              checked={allowAnalytics}
              onChange={(e) => void persistAnalyticsConsent(e.target.checked)}
            />
            <span className="text-text-soft">
              J’accepte l’analytics produit anonymisée (PostHog UE, activée uniquement après
              rechargement).
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => void downloadDataExport()}>
              <Download className="h-4 w-4 stroke-[1.5]" />
              Télécharger mes données (JSON)
            </Button>
          </div>
        </div>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Compte</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={logout}>
            <LogOut className="h-4 w-4 stroke-[1.5]" />
            Déconnexion
          </Button>
          <ConfirmDialog
            title="Supprimer toutes mes données ASCEND ?"
            description="Ton compte restera mais repas, séances, profil détaillé et préférences locales seront effacés. Pour supprimer définitivement le compte chez ton hébergeur (Auth), utilise l’outil de ton fournisseur."
            confirmLabel={purgeMutation.isPending ? "…" : "Tout effacer"}
            onConfirm={() => purgeMutation.mutate()}
            trigger={
              <Button variant="danger" loading={purgeMutation.isPending}>
                <Trash2 className="h-4 w-4 stroke-[1.5]" />
                Effacer mes données ASCEND
              </Button>
            }
          />
        </div>
      </Card>
    </div>
  );
}

function MacroPanel({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <ProgressRing
        value={value}
        max={value || 1}
        color={color}
        size={64}
        stroke={6}
        showLabel={false}
      />
      <p className="lift-body-sm text-muted">{label}</p>
      <p className="lift-display-sm text-text">{Math.round(value)} g</p>
    </div>
  );
}
