"use client";

import Link from "next/link";
import { ChevronDown, Plus, Salad, Trash2, ImageIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MacroProgressBar } from "@/components/shared/MacroProgressBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { DateNavigator } from "@/components/shared/DateNavigator";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Dialog } from "@/components/ui/Dialog";
import { MEAL_TYPES } from "@/constants/meal-types";
import { ROUTES } from "@/constants/routes";
import { useMeals } from "@/hooks/useMeals";
import { useToday } from "@/hooks/useToday";
import { createClient } from "@/services/supabase/client";
import { deleteMeal } from "@/services/supabase/queries/meals";
import { getMealPhotoUrl } from "@/services/supabase/queries/storage";
import { toUserMessage } from "@/lib/errors";
import type { MealWithIngredients, MealType } from "@/types/domain";

export default function NutritionPage() {
  const mealsQuery = useMeals();
  const { totals, targets } = useToday();
  const meals = mealsQuery.data?.meals ?? [];

  if (mealsQuery.isLoading) {
    return (
      <div className="space-y-10">
        <PageHeader title="Nutrition" actions={<DateNavigator />} />
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const remaining = Math.max(0, targets.calories - totals.calories);

  return (
    <div className="space-y-10">
      <PageHeader
        title="Nutrition"
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

      {/* ── Niveau 1 : KPI restant ── */}
      <section>
        <p className="lift-label mb-4">Restant aujourd'hui</p>
        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <span className="lift-display-xl">{Math.round(remaining)}</span>
            <span className="lift-body-soft">kcal</span>
          </div>
          <p className="lift-body-soft mt-0.5">
            {Math.round(totals.calories)} consommées · objectif {targets.calories}
          </p>

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

      {/* ── Niveau 3 : Repas du jour ── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="lift-label">Repas du jour</p>
          <Link href={ROUTES.nutritionHistory} className="lift-body-soft text-muted hover:text-text transition-colors">
            Historique →
          </Link>
        </div>

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
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

        {/* CTA bas de page, pratique sur mobile */}
        {meals.length > 0 ? (
          <div className="mt-4">
            <Link href={ROUTES.nutritionAdd} className="block">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4" />
                Ajouter un repas
              </Button>
            </Link>
          </div>
        ) : null}
      </section>
    </div>
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
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="lift-title">{label}</span>
        </div>
        <span className="lift-body-soft lift-num">{Math.round(total)} kcal</span>
      </div>
      {meals.length === 0 ? (
        <Link
          href={`${ROUTES.nutritionAdd}?type=${type}`}
          className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface/50 py-6 lift-body-soft hover:border-border-strong hover:text-text transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
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
  const [photoOpen, setPhotoOpen] = useState(false);
  const queryClient = useQueryClient();

  const photoUrlQuery = useQuery({
    queryKey: ["meal-photo-url", meal.photo_url],
    enabled: Boolean(meal.photo_url),
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      if (!meal.photo_url) return null;
      return getMealPhotoUrl(createClient(), meal.photo_url);
    },
  });

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
      <div className="flex w-full items-center gap-2">
        {meal.photo_url ? (
          <button
            type="button"
            onClick={() => setPhotoOpen(true)}
            aria-label="Agrandir la photo du repas"
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {photoUrlQuery.data ? (
              <img src={photoUrlQuery.data} alt="Photo repas" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-4 w-4 text-muted" />
              </div>
            )}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg -m-1 p-1"
        >
          <div className="min-w-0 flex-1">
            <p className="lift-display-sm">{Math.round(meal.total_calories)} kcal</p>
            <p className="lift-body-soft">
              P {Math.round(meal.total_protein)} · G {Math.round(meal.total_carbs)} · L{" "}
              {Math.round(meal.total_fats)}
            </p>
          </div>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 space-y-1 border-t border-border pt-3"
        >
          {meal.ingredients.map((ing) => (
            <div key={ing.id} className="flex justify-between lift-body-sm">
              <span className="text-text-soft">
                {ing.custom_food_name ?? "Aliment"} · {Math.round(ing.grams)}g
              </span>
              <span className="lift-num text-muted">{Math.round(ing.calories)} kcal</span>
            </div>
          ))}
          <div className="pt-2">
            <ConfirmDialog
              title="Supprimer ce repas ?"
              description="Cette action est irréversible."
              confirmLabel="Supprimer"
              onConfirm={() => deleteMutation.mutateAsync()}
              trigger={
                <button className="inline-flex items-center gap-1 lift-body-sm text-danger hover:underline">
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              }
            />
          </div>
        </motion.div>
      ) : null}

      {meal.photo_url && photoUrlQuery.data ? (
        <Dialog open={photoOpen} onOpenChange={setPhotoOpen} title="Photo du repas">
          <img src={photoUrlQuery.data} alt="Photo du repas" className="w-full rounded-xl object-contain" />
        </Dialog>
      ) : null}
    </div>
  );
}
