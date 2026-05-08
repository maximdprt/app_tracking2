"use client";
import { useMeals } from "@/hooks/useMeals";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const meals = useMeals().data?.meals ?? [];
  const sessions = useWorkoutSession().data ?? [];
  const calories = meals.reduce((acc, meal) => acc + (meal.total_calories ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Ton hub quotidien" />
      <Card className="bg-[linear-gradient(135deg,rgba(163,230,53,0.04)_0%,transparent_50%)]">
        <p className="text-text-soft text-sm">Aujourd&apos;hui en chiffres</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <StatCard label="Calories" value={Math.round(calories)} />
          <StatCard label="Repas" value={meals.length} />
          <StatCard label="Seances" value={sessions.length} />
          <StatCard label="Adherence" value={Math.min(100, meals.length * 25)} suffix="%" />
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-text-soft text-sm">Macros du jour</p>
          <div className="mt-3 flex gap-4">
            <ProgressRing value={calories} max={2500} />
          </div>
        </Card>
        <Card>
          <p className="text-text-soft text-sm">Apercu IA</p>
          <p className="text-text-soft mt-2 text-sm">
            Genere un resume avec tes donnees nutrition/training.
          </p>
          <Button
            className="mt-4"
            onClick={async () => {
              await fetch("/api/ai/summary", { method: "POST" });
            }}
          >
            Generer mon resume du jour
          </Button>
        </Card>
      </div>
    </div>
  );
}
