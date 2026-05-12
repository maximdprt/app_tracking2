"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X, Plus, ChevronLeft, Camera } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { Tabs } from "@/components/ui/Tabs";
import { Skeleton } from "@/components/ui/Skeleton";
import { MacroBar } from "@/components/shared/MacroBar";
import { PhotoAnalyzer } from "@/features/nutrition/PhotoAnalyzer";
import { useDebounce } from "@/hooks/useDebounce";
import { useDateStore } from "@/stores/useDateStore";
import { createClient } from "@/services/supabase/client";
import { searchFoods } from "@/services/supabase/queries/foods";
import { createMealWithIngredients } from "@/services/supabase/queries/meals";
import { MEAL_TYPES } from "@/constants/meal-types";
import { ROUTES } from "@/constants/routes";
import { toUserMessage } from "@/lib/errors";
import { macrosFromGrams } from "@/utils/nutrition";
import type { CartItem, FoodItem, MealType } from "@/types/domain";

type InputMode = "search" | "photo";

export default function AddMealPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedDate = useDateStore((s) => s.selectedDate);

  const [inputMode, setInputMode] = useState<InputMode>("search");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [query, setQuery] = useState("");
  const [pendingFood, setPendingFood] = useState<FoodItem | null>(null);
  const [pendingGrams, setPendingGrams] = useState(100);
  const [cart, setCart] = useState<CartItem[]>([]);

  const debouncedQuery = useDebounce(query, 300);

  const foodsQuery = useQuery({
    queryKey: ["foods", debouncedQuery],
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 60 * 60 * 1000,
    queryFn: async () => {
      const supabase = createClient();
      return searchFoods(supabase, debouncedQuery, 10);
    },
  });

  const totals = useMemo(
    () =>
      cart.reduce(
        (acc, item) => {
          const m = macrosFromGrams(item.grams, {
            calories: item.caloriesPer100g,
            protein: item.proteinPer100g,
            carbs: item.carbsPer100g,
            fats: item.fatsPer100g,
          });
          return {
            calories: acc.calories + m.calories,
            protein: acc.protein + m.protein,
            carbs: acc.carbs + m.carbs,
            fats: acc.fats + m.fats,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
      ),
    [cart],
  );

  const previewMacros = pendingFood
    ? macrosFromGrams(pendingGrams, {
        calories: pendingFood.calories_per_100g ?? 0,
        protein: pendingFood.protein_per_100g ?? 0,
        carbs: pendingFood.carbs_per_100g ?? 0,
        fats: pendingFood.fats_per_100g ?? 0,
      })
    : null;

  function addToCart() {
    if (!pendingFood) return;
    setCart((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: pendingFood.name ?? "Aliment",
        foodItemId: pendingFood.id,
        grams: pendingGrams,
        caloriesPer100g: pendingFood.calories_per_100g ?? 0,
        proteinPer100g: pendingFood.protein_per_100g ?? 0,
        carbsPer100g: pendingFood.carbs_per_100g ?? 0,
        fatsPer100g: pendingFood.fats_per_100g ?? 0,
      },
    ]);
    setPendingFood(null);
    setPendingGrams(100);
    setQuery("");
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const ingredients = cart.map((item) => {
        const m = macrosFromGrams(item.grams, {
          calories: item.caloriesPer100g,
          protein: item.proteinPer100g,
          carbs: item.carbsPer100g,
          fats: item.fatsPer100g,
        });
        return {
          user_id: user.id,
          food_item_id: item.foodItemId,
          custom_food_name: item.name,
          grams: item.grams,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fats: m.fats,
        };
      });

      await createMealWithIngredients(
        supabase,
        {
          user_id: user.id,
          meal_date: selectedDate,
          meal_type: mealType,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats,
        },
        ingredients,
      );
    },
    onSuccess: () => {
      toast.success("Repas ajouté ✓");
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      router.push(ROUTES.nutrition);
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.nutrition}
        className="inline-flex items-center gap-1 text-xs text-text-soft hover:text-text"
      >
        <ChevronLeft className="h-3 w-3" />
        Retour à la nutrition
      </Link>

      <PageHeader title="Ajouter un repas" subtitle="Cherche un aliment ou analyse une photo." />

      <ToggleGroup<MealType>
        value={mealType}
        onChange={setMealType}
        options={MEAL_TYPES.map((m) => ({ value: m.id, label: m.label, icon: m.icon }))}
        columns={4}
      />

      {/* Mode tabs */}
      <Tabs<InputMode>
        value={inputMode}
        onChange={setInputMode}
        options={[
          { value: "search", label: "Recherche", icon: <Search className="h-3.5 w-3.5" /> },
          { value: "photo", label: "Photo IA", icon: <Camera className="h-3.5 w-3.5" /> },
        ]}
      />

      {inputMode === "photo" ? (
        <PhotoAnalyzer mealType={mealType} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Search column */}
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Recherche</CardTitle>
            </CardHeader>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ex: poulet, riz, pomme..."
                className="pl-10"
                autoFocus
              />
            </div>

            <div className="mt-4 max-h-80 space-y-1 overflow-y-auto">
              {foodsQuery.isLoading ? (
                <>
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </>
              ) : null}
              {foodsQuery.data?.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => {
                    setPendingFood(food);
                    setPendingGrams(100);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors ${
                    pendingFood?.id === food.id
                      ? "border-primary bg-primary-soft"
                      : "border-border bg-surface hover:border-border-strong"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{food.name}</p>
                    {food.category ? (
                      <p className="text-[10px] text-muted">{food.category}</p>
                    ) : null}
                  </div>
                  <p className="font-mono text-xs text-text-soft">
                    {Math.round(food.calories_per_100g ?? 0)} kcal/100g
                  </p>
                </button>
              ))}
              {debouncedQuery.length >= 2 && foodsQuery.data?.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">Aucun résultat</p>
              ) : null}
            </div>

            {pendingFood ? (
              <div className="mt-4 space-y-3 rounded-xl border border-primary/20 bg-primary-soft p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{pendingFood.name}</p>
                  <button
                    type="button"
                    onClick={() => setPendingFood(null)}
                    className="text-muted hover:text-text"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={pendingGrams}
                    onChange={(e) => setPendingGrams(Number(e.target.value) || 0)}
                    className="w-24"
                    min={0}
                    max={2000}
                  />
                  <span className="text-sm text-text-soft">grammes</span>
                </div>
                {previewMacros ? (
                  <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                    <Stat label="kcal" value={previewMacros.calories} />
                    <Stat label="P" value={previewMacros.protein} suffix="g" />
                    <Stat label="G" value={previewMacros.carbs} suffix="g" />
                    <Stat label="L" value={previewMacros.fats} suffix="g" />
                  </div>
                ) : null}
                <Button onClick={addToCart} size="sm" className="w-full">
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter au repas
                </Button>
              </div>
            ) : null}
          </Card>

          {/* Cart */}
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Mon repas</CardTitle>
              <span className="font-mono text-xs text-text-soft">
                {cart.length} ingrédient{cart.length > 1 ? "s" : ""}
              </span>
            </CardHeader>

            {cart.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface/50 py-12 text-center text-sm text-muted">
                Cherche un aliment pour commencer
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => {
                  const m = macrosFromGrams(item.grams, {
                    calories: item.caloriesPer100g,
                    protein: item.proteinPer100g,
                    carbs: item.carbsPer100g,
                    fats: item.fatsPer100g,
                  });
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm">{item.name}</p>
                        <p className="text-[10px] text-muted">
                          {item.grams}g · {Math.round(m.calories)} kcal
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCart((prev) => prev.filter((c) => c.id !== item.id))}
                        className="rounded-lg p-1 text-muted hover:bg-surface hover:text-danger"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {cart.length > 0 ? (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-text-soft">Total</span>
                  <span className="font-mono text-2xl font-semibold">
                    {Math.round(totals.calories)} kcal
                  </span>
                </div>
                <MacroBar
                  protein={totals.protein}
                  carbs={totals.carbs}
                  fats={totals.fats}
                />
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => saveMutation.mutate()}
                  loading={saveMutation.isPending}
                >
                  Enregistrer le repas
                </Button>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase text-muted">{label}</p>
      <p className="text-text">
        {Math.round(value)}
        {suffix ?? ""}
      </p>
    </div>
  );
}
