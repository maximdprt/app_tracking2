"use client";

import Link from "next/link";
import { Plus, Sparkles, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToday } from "@/hooks/useToday";
import { ROUTES } from "@/constants/routes";
import { formatDateRelative, todayISO } from "@/utils/dates";

export default function DashboardPage() {
  const { profile, totals, targets, sessions, isLoading } = useToday();

  if (isLoading) return <DashboardSkeleton />;

  const calsRemaining = Math.max(0, targets.calories - totals.calories);
  const todaySession = sessions.find((s) => s.session_date === todayISO());
  const firstName = profile?.user_id?.slice(0, 2).toUpperCase() ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour${firstName ? `, ${firstName}` : ""}`}
        subtitle={formatDateRelative(todayISO())}
      />

      {/* Hero grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Calories ring — large */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>Calories aujourd'hui</CardTitle>
              <CardDescription>
                Reste {Math.round(calsRemaining)} kcal · objectif {targets.calories}
              </CardDescription>
            </div>
          </CardHeader>
          <div className="flex items-center justify-center py-2">
            <ProgressRing
              value={totals.calories}
              max={targets.calories}
              size={180}
              stroke={14}
              label={`${Math.round(totals.calories)}`}
              sublabel="kcal"
            />
          </div>
        </Card>

        {/* Macros 3 rings */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Macros</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-3 gap-3">
            <MacroBlock
              label="Protéines"
              value={totals.protein}
              max={targets.protein}
              color="var(--color-protein)"
            />
            <MacroBlock
              label="Glucides"
              value={totals.carbs}
              max={targets.carbs}
              color="var(--color-carbs)"
            />
            <MacroBlock
              label="Lipides"
              value={totals.fats}
              max={targets.fats}
              color="var(--color-fats)"
            />
          </div>
        </Card>

        {/* Stats row */}
        <StatCard
          label="Repas aujourd'hui"
          value={(totals.calories > 0 ? 1 : 0) + (totals.calories > 1500 ? 1 : 0)}
          className="lg:col-span-3"
        />
        <StatCard label="Séances 7j" value={sessions.length} className="lg:col-span-3" />
        <StatCard
          label="Sommeil moyen"
          value={profile?.average_sleep_hours ?? 0}
          suffix="h"
          decimals={1}
          className="lg:col-span-3"
        />
        <StatCard
          label="Pas / jour"
          value={profile?.average_steps ?? 0}
          className="lg:col-span-3"
        />

        {/* Today session */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Séance du jour</CardTitle>
            {todaySession ? (
              <CardDescription>
                {todaySession.workout_name ?? "Séance"} · {todaySession.status}
              </CardDescription>
            ) : (
              <CardDescription>Pas de séance enregistrée aujourd'hui.</CardDescription>
            )}
          </CardHeader>
          <Link href={todaySession ? `${ROUTES.training}/${todaySession.id}` : ROUTES.trainingStart}>
            <Button variant="secondary">
              <Zap className="h-4 w-4" />
              {todaySession ? "Continuer" : "Démarrer une séance"}
            </Button>
          </Link>
        </Card>

        {/* AI summary */}
        <Card className="lg:col-span-5 bg-[radial-gradient(circle_at_30%_20%,rgba(163,230,53,0.08)_0%,transparent_50%)]">
          <CardHeader>
            <CardTitle>Aperçu IA</CardTitle>
            <CardDescription>Synthèse motivante de ta journée.</CardDescription>
          </CardHeader>
          <Link href={ROUTES.coach}>
            <Button>
              <Sparkles className="h-4 w-4" />
              Ouvrir mon coach
            </Button>
          </Link>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href={ROUTES.nutritionAdd}>
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Ajouter un repas
          </Button>
        </Link>
        <Link href={ROUTES.trainingStart}>
          <Button variant="outline">
            <Zap className="h-4 w-4" />
            Nouvelle séance
          </Button>
        </Link>
      </div>
    </div>
  );
}

function MacroBlock({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <ProgressRing
        value={value}
        max={max || 1}
        color={color}
        size={88}
        stroke={8}
        label={`${Math.round(value)}`}
        sublabel="g"
      />
      <p className="mt-2 text-xs text-text-soft">{label}</p>
      <p className="font-mono text-[10px] text-muted">/ {Math.round(max)} g</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-64" />
      <div className="grid gap-4 lg:grid-cols-12">
        <Skeleton className="h-64 lg:col-span-5" />
        <Skeleton className="h-64 lg:col-span-7" />
        <Skeleton className="h-28 lg:col-span-3" />
        <Skeleton className="h-28 lg:col-span-3" />
        <Skeleton className="h-28 lg:col-span-3" />
        <Skeleton className="h-28 lg:col-span-3" />
      </div>
    </div>
  );
}
