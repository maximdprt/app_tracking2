"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { InsightsFeed } from "@/features/dashboard/InsightsFeed";
import { StatCard } from "@/components/shared/StatCard";
import { MacroProgressBar } from "@/components/shared/MacroProgressBar";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToday } from "@/hooks/useToday";
import { useSleep, useSteps, useLatestWeight } from "@/hooks/useDaily";
import { useUser } from "@/hooks/useUser";
import { useStreaks } from "@/hooks/useStreaks";
import { ROUTES } from "@/constants/routes";
import { formatDateRelative, todayISO } from "@/utils/dates";

export default function DashboardPage() {
  const { data: user } = useUser();
  const { totals, targets, sessions, isLoading } = useToday();
  const today = todayISO();
  const sleepQuery = useSleep(today);
  const stepsQuery = useSteps(today);
  const latestWeightQuery = useLatestWeight();
  const streaksQuery = useStreaks();

  if (isLoading) return <DashboardSkeleton />;

  const calsRemaining = Math.max(0, targets.calories - totals.calories);
  const sessionsThisWeek = sessions.filter((s) => s.status === "completed").length;
  const todaySession = sessions.find((s) => s.session_date === today);
  const todaySleep = sleepQuery.data;
  const latestWeight = latestWeightQuery.data;
  const streaks = streaksQuery.data;

  const greetingFromEmail = (email: string | undefined): string => {
    if (!email || !email.includes("@")) return "";
    const raw = email.split("@")[0]!.split(/[._-]/)[0] ?? "";
    if (!raw) return "";
    return raw.slice(0, 1).toUpperCase() + raw.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-10">
      {/* ── En-tête ── */}
      <header className="flex flex-col gap-1">
        <p className="lift-label">{formatDateRelative(today)}</p>
        <h1 className="lift-display-lg mt-1">
          {greetingFromEmail(user?.email)
            ? `Salut ${greetingFromEmail(user?.email)}`
            : "Salut"}
        </h1>
      </header>

      {/* ── Niveau 1 : KPI calories ── */}
      <section>
        <p className="lift-label mb-4">Aujourd'hui</p>
        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <span className="lift-display-xl">{Math.round(calsRemaining)}</span>
            <span className="lift-body-soft">kcal restantes</span>
          </div>
          <p className="lift-body-soft mt-0.5">sur {targets.calories} objectif</p>

          <div className="mt-6 space-y-4">
            <MacroProgressBar
              label="Protéines"
              value={totals.protein}
              max={targets.protein}
              color="var(--color-protein)"
            />
            <MacroProgressBar
              label="Glucides"
              value={totals.carbs}
              max={targets.carbs}
              color="var(--color-carbs)"
            />
            <MacroProgressBar
              label="Lipides"
              value={totals.fats}
              max={targets.fats}
              color="var(--color-fats)"
            />
          </div>
        </Card>
      </section>

      {/* ── Niveau 2 : Stats secondaires ── */}
      <section>
        <p className="lift-label mb-4">Cette semaine</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card className="p-4">
            <StatCard label="Séances" value={sessionsThisWeek} size="sm" />
          </Card>
          <Card className="p-4">
            <StatCard
              label="Streak repas"
              value={streaks?.food_log_current ?? 0}
              suffix="j"
              size="sm"
            />
          </Card>
          <Card className="p-4">
            <StatCard
              label="Poids"
              value={latestWeight ? `${latestWeight.weight} kg` : "—"}
              size="sm"
            />
          </Card>
          <Card className="p-4">
            <StatCard
              label="Sommeil"
              value={todaySleep ? `${todaySleep.hours}h` : "—"}
              size="sm"
            />
          </Card>
        </div>
      </section>

      {/* ── Niveau 3 : Prochaine action ── */}
      <section>
        <p className="lift-label mb-4">Prochaine action</p>
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="lift-title">
                {todaySession?.workout_name ?? "Séance du jour"}
              </CardTitle>
              <p className="lift-body-soft mt-1">
                {todaySession?.status === "completed"
                  ? `Terminée${todaySession.duration_minutes ? ` · ${todaySession.duration_minutes} min` : ""}`
                  : "Pas encore commencée"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href={
                todaySession ? `${ROUTES.training}/${todaySession.id}` : ROUTES.trainingStart
              }
            >
              <Button
                variant={todaySession?.status === "completed" ? "secondary" : "primary"}
                size="md"
                className="w-full sm:w-auto"
              >
                <Zap className="h-4 w-4" />
                {todaySession?.status === "completed"
                  ? "Voir le détail"
                  : todaySession
                    ? "Continuer ma séance"
                    : "Démarrer ma séance"}
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* ── Insights ── */}
      <section>
        <p className="lift-label mb-4">Insights</p>
        <Card className="p-6">
          <InsightsFeed
            totals={totals}
            targets={targets}
            sessionsThisWeek={sessionsThisWeek}
            sleepHours={todaySleep?.hours ?? null}
            steps={stepsQuery.data?.steps ?? null}
            weightTrend={null}
            streakFood={streaks?.food_log_current ?? 0}
            streakWorkout={streaks?.workout_current ?? 0}
          />
        </Card>
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}
