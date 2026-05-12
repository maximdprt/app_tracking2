"use client";

import Link from "next/link";
import { ChevronDown, Plus, Salad, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { EmptyState } from "@/components/shared/EmptyState";
import { DateNavigator } from "@/components/shared/DateNavigator";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { MEAL_TYPES } from "@/constants/meal-types";
import { ROUTES } from "@/constants/routes";
import { useMeals } from "@/hooks/useMeals";
import { useToday } from "@/hooks/useToday";
import { createClient } from "@/services/supabase/client";
import { deleteMeal } from "@/services/supabase/queries/meals";
import { toUserMessage } from "@/lib/errors";
import type { MealWithIngredients, MealType } from "@/types/domain";

export default function NutritionPage() {
  const mealsQuery = useMeals();
  const { totals, targets } = useToday();
  const meals = mealsQuery.data?.meals ?? [];

  if (mealsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Nutrition" actions={<DateNavigator />} />
        <div className="grid gap-4 lg:grid-cols-12">
          <Skeleton className="h-56 lg:col-span-7" />
          <Skeleton className="h-56 lg:col-span-5" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const remaining = Math.max(0, targets.calories - totals.calories);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nutrition"
        subtitle="Ton journal alimentaire quotidien"
        actions={
          <>
            <DateNavigator />
            <Link href={ROUTES.nutritionAdd}>
              <Button>
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Hero kcal card */}
        <Card className="lg:col-span-7 bg-[radial-gradient(circle_at_20%_20%,rgba(163,230,53,0.06)_0%,transparent_60%)]">
          <CardHeader>
            <div>
              <CardTitle>Calories du jour</CardTitle>
              <p className="text-xs text-text-soft">
                Reste <span className="font-mono text-text">{Math.round(remaining)}</span> kcal
                / objectif <span className="font-mono">{targets.calories}</span>
              </p>
            </div>
          </CardHeader>
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="font-mono text-6xl font-semibold tracking-tight">
                <AnimatedNumber value={Math.round(totals.calories)} />
              </p>
              <p className="text-sm text-text-soft">kcal consommées</p>
            </div>
            <ProgressRing
              value={totals.calories}
              max={targets.calories}
              size={140}
              stroke={12}
            />
          </div>
        </Card>

        <MacroCard
          label="Protéines"
          value={totals.protein}
          max={targets.protein}
          color="var(--color-protein)"
          className="lg:col-span-5"
        />
        <MacroCard
          label="Glucides"
          value={totals.carbs}
          max={targets.carbs}
          color="var(--color-carbs)"
          className="lg:col-span-4"
        />
        <MacroCard
          label="Lipides"
          value={totals.fats}
          max={targets.fats}
          color="var(--color-fats)"
          className="lg:col-span-4"
        />
        <Link href={ROUTES.nutritionHistory} className="lg:col-span-4">
          <Card className="flex h-full cursor-pointer items-center justify-center text-text-soft transition-colors hover:border-border-strong hover:text-text">
            <p className="text-sm">Voir l'historique →</p>
          </Card>
        </Link>
      </div>

      {/* Meals by type */}
      {meals.length === 0 ? (
        <EmptyState
          icon={Salad}
          title="Aucun repas pour cette date"
          description="Ajoute ton premier repas pour démarrer le suivi."
          action={
            <Link href={ROUTES.nutritionAdd}>
              <Button>
                <Plus className="h-4 w-4" />
                Ajouter un repas
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {MEAL_TYPES.map((mt) => (
            <MealColumn
              key={mt.id}
              type={mt.id}
              label={mt.label}
              icon={mt.icon}
              meals={meals.filter((m) => m.meal_type === mt.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MacroCard({
  label,
  value,
  max,
  color,
  className,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-3xl font-semibold tracking-tight">
            <AnimatedNumber value={Math.round(value)} />
            <span className="text-base text-text-soft"> / {Math.round(max)}g</span>
          </p>
        </div>
        <ProgressRing value={value} max={max || 1} color={color} size={64} stroke={6} showLabel={false} />
      </div>
    </Card>
  );
}

function MealColumn({
  type,
  label,
  icon,
  meals,
}: {
  type: MealType;
  label: string;
  icon: string;
  meals: MealWithIngredients[];
}) {
  const total = meals.reduce((acc, m) => acc + m.total_calories, 0);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="font-mono text-xs text-text-soft">{Math.round(total)} kcal</span>
      </div>
      {meals.length === 0 ? (
        <Link
          href={`${ROUTES.nutritionAdd}?type=${type}`}
          className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface/50 py-6 text-xs text-muted hover:border-border-strong hover:text-text-soft"
        >
          <Plus className="h-3 w-3" />
          Ajouter
        </Link>
      ) : (
        <div className="space-y-2">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </Card>
  );
}

function MealCard({ meal }: { meal: MealWithIngredients }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      await deleteMeal(supabase, meal.id);
    },
    onSuccess: () => {
      toast.success("Repas supprimé");
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex-1">
          <p className="font-mono text-sm">{Math.round(meal.total_calories)} kcal</p>
          <p className="text-[10px] text-muted">
            P {Math.round(meal.total_protein)} · G {Math.round(meal.total_carbs)} · L{" "}
            {Math.round(meal.total_fats)}
          </p>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 space-y-1 border-t border-border pt-3"
        >
          {meal.ingredients.map((ing) => (
            <div key={ing.id} className="flex justify-between text-xs">
              <span className="text-text-soft">
                {ing.custom_food_name ?? "Aliment"} · {Math.round(ing.grams)}g
              </span>
              <span className="font-mono text-muted">{Math.round(ing.calories)} kcal</span>
            </div>
          ))}
          <div className="pt-2">
            <ConfirmDialog
              title="Supprimer ce repas ?"
              description="Cette action est irréversible."
              confirmLabel="Supprimer"
              onConfirm={() => deleteMutation.mutateAsync()}
              trigger={
                <button className="inline-flex items-center gap-1 text-xs text-danger hover:underline">
                  <Trash2 className="h-3 w-3" />
                  Supprimer
                </button>
              }
            />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
