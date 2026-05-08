"use client";
import Link from "next/link";
import { Plus, Salad } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { MacroBar } from "@/components/shared/MacroBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMeals } from "@/hooks/useMeals";
export default function NutritionPage() {
  const mealsQuery = useMeals();
  const meals = mealsQuery.data?.meals ?? [];
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.total_calories ?? 0),
      protein: acc.protein + (meal.total_protein ?? 0),
      carbs: acc.carbs + (meal.total_carbs ?? 0),
      fats: acc.fats + (meal.total_fats ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
  return (
    <div className="space-y-6">
      <PageHeader title="Nutrition" subtitle="Ton journal alimentaire quotidien" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-text-soft text-sm">Calories du jour</p>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-5xl font-semibold">{Math.round(totals.calories)}</p>
            <ProgressRing value={totals.calories} max={2500} />
          </div>
        </Card>
        <Card>
          <p className="text-text-soft text-sm">Macros</p>
          <div className="mt-3 space-y-2 text-sm">
            <p>Proteines: {Math.round(totals.protein)} g</p>
            <p>Glucides: {Math.round(totals.carbs)} g</p>
            <p>Lipides: {Math.round(totals.fats)} g</p>
            <MacroBar protein={totals.protein} carbs={totals.carbs} fats={totals.fats} />
          </div>
        </Card>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Repas du jour</h2>
        <Link href="/nutrition/add">
          <Button>
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </Link>
      </div>
      {meals.length === 0 ? (
        <EmptyState
          icon={Salad}
          title="Aucun repas"
          description="Ajoute ton premier repas pour lancer le suivi nutrition."
          action={
            <Link href="/nutrition/add">
              <Button>Ajouter un repas</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {meals.map((meal) => (
            <Card key={meal.id} className="hover:border-border-strong transition-all duration-200">
              <p className="text-text-soft text-sm">{meal.meal_type}</p>
              <p className="mt-2 text-xl font-semibold">
                {Math.round(meal.total_calories ?? 0)} kcal
              </p>
              <p className="text-text-soft mt-1 text-xs">
                P {Math.round(meal.total_protein ?? 0)} / G {Math.round(meal.total_carbs ?? 0)} / L{" "}
                {Math.round(meal.total_fats ?? 0)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
