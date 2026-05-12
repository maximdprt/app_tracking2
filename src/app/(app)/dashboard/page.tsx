"use client";

import type React from "react";
import Link from "next/link";
import { Plus, Sparkles, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToday } from "@/hooks/useToday";
import { useSleep, useSteps, useLatestWeight } from "@/hooks/useDaily";
import { ROUTES } from "@/constants/routes";
import { formatDateRelative, todayISO } from "@/utils/dates";

export default function DashboardPage() {
  const { profile, totals, targets, sessions, isLoading } = useToday();
  const today = todayISO();
  const sleepQuery = useSleep(today);
  const stepsQuery = useSteps(today);
  const latestWeightQuery = useLatestWeight();

  if (isLoading) return <DashboardSkeleton />;

  const calsRemaining = Math.max(0, targets.calories - totals.calories);
  const todaySession = sessions.find((s) => s.session_date === today);
  const firstName = profile?.user_id?.slice(0, 2).toUpperCase() ?? "";

  const todaySleep = sleepQuery.data;
  const todaySteps = stepsQuery.data;
  const latestWeight = latestWeightQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour${firstName ? `, ${firstName}` : ""}`}
        subtitle={formatDateRelative(today)}
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

        {/* Sleep stat — from daily log */}
        <div className="lg:col-span-3">
          {sleepQuery.isLoading ? (
            <Skeleton className="h-28" />
          ) : todaySleep ? (
            <DailyStatCard
              label="Sommeil"
              value={`${todaySleep.hours}h`}
              badge={<Badge variant="success">Aujourd'hui</Badge>}
            />
          ) : (
            <DailyStatCard
              label="Sommeil"
              value="—"
              muted
              action={<Link href={ROUTES.habits} className="text-xs text-primary hover:underline">Ajouter</Link>}
            />
          )}
        </div>

        {/* Steps stat — from daily log */}
        <div className="lg:col-span-3">
          {stepsQuery.isLoading ? (
            <Skeleton className="h-28" />
          ) : todaySteps ? (
            <DailyStatCard
              label="Pas"
              value={todaySteps.steps.toLocaleString()}
              badge={<Badge variant="success">Aujourd'hui</Badge>}
            />
          ) : (
            <DailyStatCard
              label="Pas"
              value="—"
              muted
              action={<Link href={ROUTES.habits} className="text-xs text-primary hover:underline">Ajouter</Link>}
            />
          )}
        </div>

        {/* Weight stat */}
        <div className="lg:col-span-3">
          {latestWeightQuery.isLoading ? (
            <Skeleton className="h-28" />
          ) : latestWeight ? (
            <DailyStatCard
              label="Poids"
              value={`${latestWeight.weight} kg`}
              badge={
                latestWeight.log_date === today ? (
                  <Badge variant="success">Aujourd'hui</Badge>
                ) : undefined
              }
            />
          ) : (
            <DailyStatCard
              label="Poids"
              value="—"
              muted
              action={<Link href={ROUTES.habits} className="text-xs text-primary hover:underline">Ajouter</Link>}
            />
          )}
        </div>

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
          {todaySession?.status === "completed" ? (
            <div className="space-y-2">
              <div className="flex gap-4 text-sm">
                {todaySession.duration_minutes ? (
                  <span className="text-text-soft">
                    <span className="font-mono text-text">{todaySession.duration_minutes}</span> min
                  </span>
                ) : null}
              </div>
              <Link href={`${ROUTES.training}/${todaySession.id}`}>
                <Button variant="secondary" size="sm">
                  Voir le détail
                </Button>
              </Link>
            </div>
          ) : (
            <Link
              href={
                todaySession ? `${ROUTES.training}/${todaySession.id}` : ROUTES.trainingStart
              }
            >
              <Button variant={todaySession ? "secondary" : "primary"} size="lg" className="w-full">
                <Zap className="h-4 w-4" />
                {todaySession ? "Continuer ma séance" : "Démarrer ma séance"}
              </Button>
            </Link>
          )}
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

function DailyStatCard({
  label,
  value,
  badge,
  muted,
  action,
}: {
  label: string;
  value: string;
  badge?: React.ReactNode;
  muted?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <Card className="flex h-28 flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        {badge}
      </div>
      <p className={`font-mono text-2xl font-semibold ${muted ? "text-muted" : "text-text"}`}>
        {value}
      </p>
      {action ? <div>{action}</div> : <span />}
    </Card>
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
