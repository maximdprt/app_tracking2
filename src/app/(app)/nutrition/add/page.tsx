"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Plus, ChevronLeft, Camera, Heart, Clock, Sparkles, Barcode } from "lucide-react";
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
import { CreateCustomFoodModal } from "@/features/nutrition/CreateCustomFoodModal";
import { useDateStore } from "@/stores/useDateStore";
import { createClient } from "@/services/supabase/client";
import { createMealWithIngredients } from "@/services/supabase/queries/meals";
import { MEAL_TYPES } from "@/constants/meal-types";
import { ROUTES } from "@/constants/routes";
import { toUserMessage } from "@/lib/errors";
import { openFoodFactsProductToFoodItem } from "@/lib/open-food-facts/map-product";
import { macrosFromGrams, per100gMacrosFromFoodItem } from "@/utils/nutrition";
import { useFoodSearch, useRecentFoods } from "@/hooks/useFoodSearch";
import { useFoodFavorites } from "@/hooks/useFoodFavorites";
import { useUser } from "@/hooks/useUser";
import type { CartItem, FoodItem, MealType } from "@/types/domain";

type InputMode = "search" | "photo";
type SearchTab = "search" | "recents" | "favorites";

export default function AddMealPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const selectedDate = useDateStore((s) => s.selectedDate);

  const [inputMode, setInputMode] = useState<InputMode>("search");
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [query, setQuery] = useState("");
  const [searchTab, setSearchTab] = useState<SearchTab>("search");
  const [pendingFood, setPendingFood] = useState<FoodItem | null>(null);
  const [pendingGrams, setPendingGrams] = useState(100);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [createCustomOpen, setCreateCustomOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  const foodsQuery = useFoodSearch(query);
  const recentsQuery = useRecentFoods(8);
  const { favorites, favoriteIds, toggle: toggleFav } = useFoodFavorites();

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
    ? macrosFromGrams(pendingGrams, per100gMacrosFromFoodItem(pendingFood))
    : null;

  function selectFood(food: FoodItem) {
    setPendingFood(food);
    setPendingGrams(100);
  }

  function addToCart() {
    if (!pendingFood) return;
    const per100 = per100gMacrosFromFoodItem(pendingFood);
    setCart((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: pendingFood.name ?? pendingFood.nom ?? "Aliment",
        foodItemId: pendingFood.id.startsWith("custom_") || pendingFood.id.startsWith("OPENFOODFACTS:")
          ? null
          : pendingFood.id,
        grams: pendingGrams,
        caloriesPer100g: per100.calories,
        proteinPer100g: per100.protein,
        carbsPer100g: per100.carbs,
        fatsPer100g: per100.fats,
      },
    ]);
    setPendingFood(null);
    setPendingGrams(100);
    setQuery("");
  }

  async function lookupBarcode(): Promise<void> {
    const code = barcode.replace(/\D/g, "");
    if (code.length < 8) {
      toast.error("Code-barres trop court.");
      return;
    }
    setBarcodeLoading(true);
    try {
      const res = await fetch(`/api/open-food-facts/${encodeURIComponent(code)}`);
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
        product?: unknown;
      };
      if (!res.ok) {
        toast.error(body.error ?? "Erreur");
        return;
      }
      const food = openFoodFactsProductToFoodItem(body.code ?? code, body.product ?? null);
      if (!food) {
        toast.error("Données nutritionnelles insuffisantes.");
        return;
      }
      selectFood(food);
      setBarcode("");
      toast.success(`${food.name ?? food.nom} — importé depuis Open Food Facts`);
    } finally {
      setBarcodeLoading(false);
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) throw new Error("Unauthorized");

      const ingredients = cart.map((item) => {
        const m = macrosFromGrams(item.grams, {
          calories: item.caloriesPer100g,
          protein: item.proteinPer100g,
          carbs: item.carbsPer100g,
          fats: item.fatsPer100g,
        });
        return {
          user_id: authUser.id,
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
          user_id: authUser.id,
          meal_date: selectedDate,
          meal_type: mealType,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats,
        },
        ingredients,
      );

      // Update streak for food log (upsert_streak RPC added in migration 0008)
      if (user?.id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .rpc("upsert_streak", { p_user_id: user.id, p_type: "food", p_date: selectedDate })
          .then(() => {})
          .catch(() => {});
      }
    },
    onSuccess: () => {
      toast.success("Repas ajouté ✓");
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["foods-recent"] });
      router.push(ROUTES.nutrition);
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  // Determine which list to show
  const displayList: FoodItem[] =
    searchTab === "recents"
      ? (recentsQuery.data ?? [])
      : searchTab === "favorites"
        ? favorites
        : (foodsQuery.data ?? []);

  const isListLoading =
    searchTab === "search"
      ? foodsQuery.isLoading
      : searchTab === "recents"
        ? recentsQuery.isLoading
        : false;

  const isEmpty =
    !isListLoading &&
    displayList.length === 0 &&
    (searchTab !== "search" || query.trim().length >= 2);

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

      <Card className="border-[var(--lift-border-subtle)]">
        <CardHeader>
          <CardTitle className="text-base">Code-barres · Open Food Facts</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-3 px-6 pb-6 sm:flex-row sm:items-center">
          <Input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="EAN‑8 … EAN‑13"
            inputMode="numeric"
            autoComplete="off"
            className="sm:flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            loading={barcodeLoading}
            onClick={() => void lookupBarcode()}
          >
            <Barcode className="h-4 w-4" />
            Chercher
          </Button>
        </div>
      </Card>

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
              <CardTitle>Aliments</CardTitle>
              <button
                type="button"
                onClick={() => setCreateCustomOpen(true)}
                className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] text-text-soft transition-colors hover:border-primary hover:text-primary"
              >
                <Sparkles className="h-3 w-3" />
                Créer
              </button>
            </CardHeader>

            {/* Sub-tabs: Recherche / Récents / Favoris */}
            <div className="mb-4 flex gap-1 rounded-full border border-border bg-surface-2 p-1 text-xs">
              {(
                [
                  { id: "search", label: "Recherche", icon: Search },
                  { id: "recents", label: "Récents", icon: Clock },
                  { id: "favorites", label: "Favoris", icon: Heart },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSearchTab(id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 transition-colors ${
                    searchTab === id
                      ? "bg-primary text-on-primary"
                      : "text-text-soft hover:text-text"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Search input only visible in search tab */}
            {searchTab === "search" && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ex: poulet, riz, pomme..."
                  className="pl-10"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Food list */}
            <div className="max-h-80 space-y-1 overflow-y-auto">
              {isListLoading ? (
                <>
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                </>
              ) : isEmpty ? (
                <p className="py-8 text-center text-sm text-muted">
                  {searchTab === "search"
                    ? query.length < 2
                      ? "Tape 2 caractères minimum"
                      : "Aucun résultat"
                    : searchTab === "recents"
                      ? "Aucun aliment récent"
                      : "Aucun favori — ★ pour en ajouter"}
                </p>
              ) : (
                displayList.map((food) => {
                  const isFav = favoriteIds.has(food.id);
                  const isSelected = pendingFood?.id === food.id;
                  return (
                    <div
                      key={food.id}
                      className={`group flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-surface hover:border-border-strong"
                      }`}
                    >
                      <button
                        type="button"
                        className="flex flex-1 items-center justify-between text-left"
                        onClick={() => selectFood(food)}
                      >
                        <div>
                          <p className="text-sm font-medium">{food.name ?? food.nom}</p>
                          {(food as unknown as { category?: string }).category ? (
                            <p className="text-[10px] text-muted">
                              {(food as unknown as { category?: string }).category}
                            </p>
                          ) : null}
                        </div>
                        <p className="font-mono text-xs text-text-soft">
                          {Math.round(per100gMacrosFromFoodItem(food).calories)} kcal/100g
                        </p>
                      </button>

                      {/* Fav toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (user?.id) toggleFav(food.id);
                        }}
                        className={`rounded-full p-1 transition-colors ${
                          isFav
                            ? "text-red-500 hover:text-red-400"
                            : "text-muted opacity-0 hover:text-red-400 group-hover:opacity-100"
                        }`}
                        aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pending food detail */}
            {pendingFood ? (
              <div className="mt-4 space-y-3 rounded-xl border border-primary/20 bg-primary-soft p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{pendingFood.name ?? pendingFood.nom}</p>
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

      <CreateCustomFoodModal
        open={createCustomOpen}
        onClose={() => setCreateCustomOpen(false)}
        onAdded={(food) => {
          selectFood(food);
          setCreateCustomOpen(false);
        }}
      />
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
