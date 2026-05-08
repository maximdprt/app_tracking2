"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MEAL_TYPES, MealType } from "@/constants/meal-types";
import { useDebounce } from "@/hooks/useDebounce";
import { createClient } from "@/services/supabase/client";
import { searchFoods } from "@/services/supabase/queries/foods";
import { createMealWithIngredients } from "@/services/supabase/queries/meals";
import { useDateStore } from "@/stores/useDateStore";
type CartItem = {
  id: string;
  name: string;
  foodItemId: string | null;
  grams: number;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatsPer100g: number;
};
export default function NutritionAddPage() {
  const selectedDate = useDateStore((s) => s.selectedDate);
  const [query, setQuery] = useState("");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [grams, setGrams] = useState(100);
  const [cart, setCart] = useState<CartItem[]>([]);
  const debounced = useDebounce(query, 300);
  const queryClient = useQueryClient();
  const foodsQuery = useQuery({
    queryKey: ["foods", debounced],
    enabled: debounced.length > 0,
    queryFn: async () => {
      const supabase = createClient();
      return searchFoods(supabase, debounced, 20);
    },
  });
  const totals = useMemo(
    () =>
      cart.reduce(
        (acc, item) => {
          const ratio = item.grams / 100;
          return {
            calories: acc.calories + item.caloriesPer100g * ratio,
            protein: acc.protein + item.proteinPer100g * ratio,
            carbs: acc.carbs + item.carbsPer100g * ratio,
            fats: acc.fats + item.fatsPer100g * ratio,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
      ),
    [cart],
  );
  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
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
        cart.map((item) => ({
          user_id: user.id,
          food_item_id: item.foodItemId,
          custom_food_name: item.name,
          grams: item.grams,
          calories: (item.caloriesPer100g * item.grams) / 100,
          protein: (item.proteinPer100g * item.grams) / 100,
          carbs: (item.carbsPer100g * item.grams) / 100,
          fats: (item.fatsPer100g * item.grams) / 100,
        })),
      );
    },
    onSuccess: () => {
      toast.success("Repas ajoute");
      setCart([]);
      void queryClient.invalidateQueries({ queryKey: ["meals", selectedDate] });
    },
    onError: () => toast.error("Impossible d'enregistrer le repas"),
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Ajouter un repas" subtitle="Recherche, panier et enregistrement" />
      <div className="flex flex-wrap gap-2">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={`rounded-xl border px-3 py-2 text-sm ${mealType === type ? "border-primary bg-primary-soft" : "border-border bg-surface"}`}
            onClick={() => setMealType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un aliment..."
          />
          <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
            {(foodsQuery.data ?? []).map((food) => {
              const name = food.name ?? food.nom ?? "Aliment";
              const calories = food.calories_per_100g ?? food.calories_100g ?? 0;
              const protein = food.protein_per_100g ?? food.proteines_100g ?? 0;
              const carbs = food.carbs_per_100g ?? food.glucides_100g ?? 0;
              const fats = food.fats_per_100g ?? food.lipides_100g ?? 0;
              return (
                <button
                  key={food.id}
                  type="button"
                  className="border-border hover:border-border-strong w-full rounded-xl border p-3 text-left"
                  onClick={() =>
                    setCart((prev) => [
                      ...prev,
                      {
                        id: `${food.id}-${prev.length}`,
                        name,
                        foodItemId: food.id,
                        grams,
                        caloriesPer100g: calories,
                        proteinPer100g: protein,
                        carbsPer100g: carbs,
                        fatsPer100g: fats,
                      },
                    ])
                  }
                >
                  <p className="font-medium">{name}</p>
                  <p className="text-text-soft text-xs">{Math.round(calories)} kcal / 100g</p>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-text-soft text-sm">Quantite:</span>
            <Input
              className="w-24"
              type="number"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
            />
            <span className="text-text-soft text-sm">g</span>
          </div>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Panier</h3>
          <div className="mt-3 space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="border-border rounded-lg border p-3">
                <p className="font-medium">{item.name}</p>
                <p className="text-text-soft text-xs">{item.grams} g</p>
              </div>
            ))}
            {cart.length === 0 ? <p className="text-text-soft text-sm">Aucun ingredient</p> : null}
          </div>
          <div className="text-text-soft mt-4 text-sm">
            <p>Calories: {Math.round(totals.calories)}</p>
            <p>
              P: {Math.round(totals.protein)} g / G: {Math.round(totals.carbs)} g / L:{" "}
              {Math.round(totals.fats)} g
            </p>
          </div>
          <Button
            className="mt-4 w-full"
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            Enregistrer
          </Button>
        </Card>
      </div>
    </div>
  );
}
