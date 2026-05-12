"use client";

import type React from "react";
import Link from "next/link";
import { Flame, Plus, Sparkles, Zap } from "lucide-react";
import { InsightsFeed } from "@/features/dashboard/InsightsFeed";
import { WeeklyCompareCard } from "@/features/dashboard/WeeklyCompareCard";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MacroRing } from "@/design/components";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToday } from "@/hooks/useToday";
import { useSleep, useSteps, useLatestWeight } from "@/hooks/useDaily";
import { useStreaks } from "@/hooks/useStreaks";
import { ROUTES } from "@/constants/routes";
import { formatDateRelative, todayISO } from "@/utils/dates";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/services/supabase/client";
import { useUser } from "@/hooks/useUser";
import { getWeightHistory } from "@/services/supabase/queries/stats";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { totals, targets, sessions, isLoading } = useToday();
  const { data: user } = useUser();
  const today = todayISO();
  const sleepQuery = useSleep(today);
  const stepsQuery = useSteps(today);
  const latestWeightQuery = useLatestWeight();
  const streaksQuery = useStreaks();

  const weightHistoryQuery = useQuery({
    queryKey: ["weight-history-trend", user?.id],
    enabled: Boolean(user?.id),
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      if (!user?.id) return [];
      const supabase = createClient();
      return getWeightHistory(supabase, user.id);
    },
  });

  if (isLoading) return <DashboardSkeleton />;

  const calsRemaining = Math.max(0, targets.calories - totals.calories);

  const greetingFromEmail = (email: string | undefined): string => {
    if (!email || !email.includes("@")) return "";
    const raw = email.split("@")[0]!.split(/[._-]/)[0] ?? "";
    if (!raw) return "";
    return raw.slice(0, 1).toUpperCase() + raw.slice(1).toLowerCase();
  };

  const displayFirstName = greetingFromEmail(user?.email);

  const todaySession = sessions.find((s) => s.session_date === today);
  const todaySleep = sleepQuery.data;
  const todaySteps = stepsQuery.data;
  const latestWeight = latestWeightQuery.data;
  const streaks = streaksQuery.data;
  const sessionsThisWeek = sessions.filter((s) => s.status === "completed").length;

  // Weight trend over 30 days
  const weightTrend = (() => {
    const wh = weightHistoryQuery.data ?? [];
    if (wh.length < 2) return null;
    return Math.round((wh[wh.length - 1]!.weight - wh[0]!.weight) * 10) / 10;
  })();

  return (
    <div className="space-y-10">
      <header className="mb-2 flex flex-col gap-2">
        <p className="lift-label-md text-muted">{formatDateRelative(today)}</p>
        <h1 className="lift-display-lg text-text">
          Salut{displayFirstName ? ` ${displayFirstName}` : ""}
        </h1>
      </header>

      {/* Hero — MacroRing */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="border-[var(--lift-border-subtle)] bg-[var(--lift-bg-card)] p-6 sm:p-8 lg:col-span-12 md-elevation-1">
          <CardHeader>
            <div>
              <CardTitle className="lift-title-lg">Macros du jour</CardTitle>
              <CardDescription>
                Reste {Math.round(calsRemaining)} kcal · objectif {targets.calories}
              </CardDescription>
            </div>
          </CardHeader>
          <div className="py-4">
            <MacroRing totals={totals} targets={targets} />
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
                    <span className="lift-num text-text">{todaySession.duration_minutes}</span> min
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
                <Zap className="h-4 w-4 stroke-[1.5]" />
                {todaySession ? "Continuer ma séance" : "Démarrer ma séance"}
              </Button>
            </Link>
          )}
        </Card>

        {/* AI summary */}
        <Card className="lg:col-span-5 bg-[radial-gradient(circle_at_30%_20%,color-mix(in_srgb,var(--lift-text-primary)_7%,transparent)_0%,transparent_50%)]">
          <CardHeader>
            <CardTitle>Aperçu IA</CardTitle>
            <CardDescription>Synthèse motivante de ta journée.</CardDescription>
          </CardHeader>
          <Link href={ROUTES.coach}>
            <Button>
              <Sparkles className="h-4 w-4 stroke-[1.5]" />
              Ouvrir mon coach
            </Button>
          </Link>
        </Card>
      </div>

      <WeeklyCompareCard />

      {/* Streaks row */}
      {(streaks?.food_log_current ?? 0) > 0 || (streaks?.workout_current ?? 0) > 0 ? (
        <div className="flex flex-wrap gap-3">
          {(streaks?.food_log_current ?? 0) > 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2">
              <Flame className="h-4 w-4 stroke-[1.5] text-orange-500" />
              <span className="lift-body-sm font-semibold text-text">
                {streaks!.food_log_current}j
              </span>
              <span className="lift-body-sm text-text-soft">log repas</span>
            </div>
          ) : null}
          {(streaks?.workout_current ?? 0) > 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2">
              <Zap className="h-4 w-4 stroke-[1.5] text-primary" />
              <span className="lift-body-sm font-semibold text-text">
                {streaks!.workout_current}j
              </span>
              <span className="lift-body-sm text-text-soft">séances</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights du jour</CardTitle>
        </CardHeader>
        <InsightsFeed
          totals={totals}
          targets={targets}
          sessionsThisWeek={sessionsThisWeek}
          sleepHours={todaySleep?.hours ?? null}
          steps={todaySteps?.steps ?? null}
          weightTrend={weightTrend}
          streakFood={streaks?.food_log_current ?? 0}
          streakWorkout={streaks?.workout_current ?? 0}
        />
      </Card>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Link href={ROUTES.nutritionAdd}>
          <Button variant="outline">
            <Plus className="h-4 w-4 stroke-[1.5]" />
            Ajouter un repas
          </Button>
        </Link>
        <Link href={ROUTES.trainingStart}>
          <Button variant="outline">
            <Zap className="h-4 w-4 stroke-[1.5]" />
            Nouvelle séance
          </Button>
        </Link>
      </div>
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
        <p className="lift-label-md text-muted">{label}</p>
        {badge}
      </div>
      <p className={cn("lift-display-md", muted ? "text-muted" : "text-text")}>{value}</p>
      {action ? <div>{action}</div> : <span />}
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
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
