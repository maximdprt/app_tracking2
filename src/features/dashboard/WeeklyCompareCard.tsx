"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWeeklyNutritionCompare } from "@/hooks/useWeeklyNutritionCompare";
import { cn } from "@/lib/utils";

export function WeeklyCompareCard() {
  const q = useWeeklyNutritionCompare();

  if (q.isLoading) return <Skeleton className="h-28 w-full" />;
  if (!q.data) return null;

  const { thisWeekAvg, prevWeekAvg } = q.data;
  const pct =
    prevWeekAvg.calories > 0
      ? Math.round(
          ((thisWeekAvg.calories - prevWeekAvg.calories) / prevWeekAvg.calories) * 1000,
        ) / 10
      : 0;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Semaine en cours vs précédente</CardTitle>
          <CardDescription>
            Moyennes journalières comparées aux 7 jours précédents.
          </CardDescription>
        </div>
      </CardHeader>
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="lift-label">Kcal · cette semaine</p>
          <p className="lift-display-md mt-1 lift-num">{Math.round(thisWeekAvg.calories)}</p>
        </div>
        <div>
          <p className="lift-label">Kcal · semaine d'avant</p>
          <p className="lift-display-md mt-1 lift-num text-muted">{Math.round(prevWeekAvg.calories)}</p>
        </div>
        <div>
          <p className="lift-label">Variation</p>
          <p
            className={cn(
              "lift-display-md mt-1 lift-num",
              pct > 3 ? "text-warning" : pct < -3 ? "text-success" : "",
            )}
          >
            {pct > 0 ? "+" : ""}{pct}%
          </p>
        </div>
      </div>
    </Card>
  );
}
