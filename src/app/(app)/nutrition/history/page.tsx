"use client";
import { useMeals } from "@/hooks/useMeals";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { formatHumanDate } from "@/utils/dates";
export default function NutritionHistoryPage() {
  const meals = useMeals().data?.meals ?? [];
  return (
    <div className="space-y-6">
      <PageHeader title="Historique Nutrition" subtitle="30 derniers jours" />
      <div className="space-y-2">
        {meals.map((meal) => (
          <Card key={meal.id}>
            <p className="text-text-soft text-sm">{formatHumanDate(meal.meal_date)}</p>
            <p className="mt-2 text-lg font-semibold">
              {Math.round(meal.total_calories ?? 0)} kcal
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
