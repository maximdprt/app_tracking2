"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWeeklyNutritionCompare } from "@/hooks/useWeeklyNutritionCompare";

export function WeeklyCompareCard() {
  const q = useWeeklyNutritionCompare();

  if (q.isLoading) return <Skeleton className="h-28 w-full lg:col-span-12" />;
  if (!q.data) return null;

  const { thisWeekAvg, prevWeekAvg } = q.data;
  const pct =
    prevWeekAvg.calories > 0
      ? Math.round(
          ((thisWeekAvg.calories - prevWeekAvg.calories) / prevWeekAvg.calories) * 1000,
        ) / 10
      : 0;

  return (
    <Card className="border-(--lift-border-subtle) bg-(--lift-bg-secondary) lg:col-span-12">
      <CardHeader>
        <div>
          <CardTitle>Macros — semaine en cours vs précédente</CardTitle>
          <CardDescription>
            Moyennes journalières (lun–aujourd’hui) comparées aux 7 jours précédents.
          </CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-wrap gap-6 px-6 pb-6 lift-body-sm">
        <div>
          <p className="lift-label-sm text-muted">Kcal · cette semaine</p>
          <p className="lift-display-sm text-text tracking-tight">
            {Math.round(thisWeekAvg.calories)}
          </p>
        </div>
        <div>
          <p className="lift-label-sm text-muted">Kcal · semaine d’avant</p>
          <p className="lift-display-sm text-muted tracking-tight">
            {Math.round(prevWeekAvg.calories)}
          </p>
        </div>
        <div>
          <p className="lift-label-sm text-muted">Δ calories</p>
          <p
            className={`lift-display-sm tracking-tight lift-num ${
              pct > 3 ? "text-(--lift-accent-secondary)" : pct < -3 ? "text-(--lift-accent-primary)" : "text-text"
            }`}
          >
            {pct > 0 ? "+" : ""}
            {pct}%
          </p>
        </div>
      </div>
    </Card>
  );
}
