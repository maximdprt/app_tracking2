"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { MacroBar } from "@/components/shared/MacroBar";
import { createClient } from "@/services/supabase/client";
import { searchFoods } from "@/services/supabase/queries/foods";
import { createMealWithIngredients } from "@/services/supabase/queries/meals";
import { uploadMealPhoto } from "@/services/supabase/queries/storage";
import { ROUTES } from "@/constants/routes";
import { toUserMessage } from "@/lib/errors";
import { macrosFromGrams, per100gMacrosFromFoodItem } from "@/utils/nutrition";
import { useDateStore } from "@/stores/useDateStore";
import type { MealPhotoAnalysisApiResponse } from "@/types/meal-photo";
import type { FoodItem, MealType } from "@/types/domain";

interface PhotoAnalyzerProps {
  mealType: MealType;
}

type Phase = "upload" | "analyzing" | "review" | "saving";

interface IngredientRow {
  key: string;
  name: string;
  grams: number;
  estimatedGrams: number;
  confidence: number;
  food: FoodItem | null;
  loadingFood: boolean;
}

export function PhotoAnalyzer({ mealType }: PhotoAnalyzerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedDate = useDateStore((s) => s.selectedDate);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("upload");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MealPhotoAnalysisApiResponse | null>(null);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Photo trop lourde (max 8MB)");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Fichier non supporté, choisis une image");
      return;
    }
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }, []);

  async function handleAnalyze() {
    if (!photoFile) return;
    setPhase("analyzing");

    try {
      const formData = new FormData();
      formData.append("photo", photoFile);

      const res = await fetch("/api/ai/meal-photo", { method: "POST", body: formData });
      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string };
        throw new Error(errorData.error ?? "Erreur analyse");
      }
      const result = (await res.json()) as MealPhotoAnalysisApiResponse;

      if (result.ingredients.length === 0) {
        toast.warning(
          "Aucun aliment détecté, essaie une photo plus claire ou utilise la recherche manuelle",
        );
        setPhase("upload");
        return;
      }

      setAnalysisResult(result);

      // Lignes pré-remplies avec les `food_items` résolus côté serveur (Supabase)
      const rows: IngredientRow[] = result.ingredients.map((ing) => ({
        key: crypto.randomUUID(),
        name: ing.name,
        grams: ing.estimatedGrams,
        estimatedGrams: ing.estimatedGrams,
        confidence: ing.confidence,
        food: ing.food_item,
        loadingFood: false,
      }));
      setIngredients(rows);
      setPhase("review");
    } catch (err) {
      toast.error(toUserMessage(err));
      setPhase("upload");
    }
  }

  function updateIngredientName(key: string, name: string) {
    setIngredients((prev) => prev.map((r) => (r.key === key ? { ...r, name } : r)));
  }

  function updateIngredientGrams(key: string, grams: number) {
    setIngredients((prev) => prev.map((r) => (r.key === key ? { ...r, grams } : r)));
  }

  function removeIngredient(key: string) {
    setIngredients((prev) => prev.filter((r) => r.key !== key));
  }

  function addManualIngredient() {
    setIngredients((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        name: "",
        grams: 100,
        estimatedGrams: 100,
        confidence: 1,
        food: null,
        loadingFood: false,
      },
    ]);
  }

  const totals = ingredients.reduce(
    (acc, row) => {
      if (!row.food) return acc;
      const m = macrosFromGrams(row.grams, per100gMacrosFromFoodItem(row.food));
      return {
        calories: acc.calories + m.calories,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fats: acc.fats + m.fats,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      let photoPath: string | null = null;
      if (photoFile) {
        photoPath = await uploadMealPhoto(supabase, user.id, photoFile);
      }

      const mealIngredients = ingredients
        .filter((r) => r.food !== null)
        .map((row) => {
          const m = macrosFromGrams(row.grams, per100gMacrosFromFoodItem(row.food!));
          return {
            user_id: user.id,
            food_item_id: row.food!.id,
            custom_food_name: row.name,
            grams: row.grams,
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
          photo_url: photoPath,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats,
        },
        mealIngredients,
      );
    },
    onSuccess: () => {
      toast.success("Repas analysé et enregistré ✓");
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      router.push(ROUTES.nutrition);
    },
    onError: (err) => toast.error(toUserMessage(err)),
  });

  if (phase === "upload") {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              Prends une photo de ton repas
            </CardTitle>
          </CardHeader>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />

          {photoPreview ? (
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={photoPreview}
                alt="Aperçu"
                className="h-64 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-surface/80 p-1 text-text backdrop-blur-sm hover:bg-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface/50 text-muted transition-colors hover:border-border-strong hover:text-text-soft"
            >
              <Camera className="h-10 w-10" />
              <span className="text-sm">Cliquer pour ajouter une photo</span>
            </button>
          )}

          {photoFile ? (
            <Button size="lg" className="w-full" onClick={handleAnalyze}>
              <Camera className="h-4 w-4" />
              Analyser avec l'IA
            </Button>
          ) : null}
        </Card>
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div>
            <p className="font-medium">Analyse en cours…</p>
            <p className="mt-1 text-sm text-text-soft">
              Je détecte les ingrédients dans ta photo
            </p>
          </div>
          <div className="w-full space-y-2">
            <Skeleton className="h-4" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Photo preview */}
      {photoPreview ? (
        <div className="overflow-hidden rounded-xl">
          <img src={photoPreview} alt="Repas" className="h-40 w-full object-cover" />
        </div>
      ) : null}

      {/* Description */}
      {analysisResult?.description ? (
        <p className="text-sm font-medium">{analysisResult.description}</p>
      ) : null}

      {/* Ingredient rows */}
      <div className="space-y-3">
        {ingredients.map((row) => (
          <IngredientCard
            key={row.key}
            row={row}
            onNameChange={(name) => updateIngredientName(row.key, name)}
            onGramsChange={(grams) => updateIngredientGrams(row.key, grams)}
            onRemove={() => removeIngredient(row.key)}
            onFoodChange={(food) =>
              setIngredients((prev) =>
                prev.map((r) => (r.key === row.key ? { ...r, food } : r)),
              )
            }
          />
        ))}
      </div>

      <Button variant="secondary" onClick={addManualIngredient} className="w-full">
        <Plus className="h-4 w-4" />
        Ajouter un ingrédient manuellement
      </Button>

      {/* Totals */}
      {totals.calories > 0 ? (
        <Card>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-text-soft">Total estimé</span>
            <span className="font-mono text-2xl font-semibold">
              {Math.round(totals.calories)} kcal
            </span>
          </div>
          <MacroBar protein={totals.protein} carbs={totals.carbs} fats={totals.fats} />
        </Card>
      ) : null}

      <Button
        size="lg"
        className="w-full"
        onClick={() => saveMutation.mutate()}
        loading={saveMutation.isPending || phase === "saving"}
        disabled={ingredients.filter((r) => r.food).length === 0}
      >
        Enregistrer le repas
      </Button>
    </div>
  );
}

function IngredientCard({
  row,
  onNameChange,
  onGramsChange,
  onRemove,
  onFoodChange,
}: {
  row: IngredientRow;
  onNameChange: (name: string) => void;
  onGramsChange: (grams: number) => void;
  onRemove: () => void;
  onFoodChange: (food: FoodItem) => void;
}) {
  const macros =
    row.food && row.grams > 0
      ? macrosFromGrams(row.grams, per100gMacrosFromFoodItem(row.food))
      : null;

  // Auto-search query state
  const [searchQuery, setSearchQuery] = useState(row.name);
  const debouncedQuery = searchQuery;

  const foodSearchQuery = useQuery({
    queryKey: ["foods-search", debouncedQuery],
    enabled: debouncedQuery.length >= 2,
    staleTime: 300_000,
    queryFn: async () => searchFoods(createClient(), debouncedQuery, 5),
  });

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={row.name}
              onChange={(e) => {
                onNameChange(e.target.value);
                setSearchQuery(e.target.value);
              }}
              placeholder="Nom de l'ingrédient"
              className="flex-1 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={row.grams}
              onChange={(e) => onGramsChange(Number(e.target.value) || 0)}
              min={0}
              className="w-24 text-sm"
            />
            <span className="text-xs text-text-soft">g</span>
          </div>

          {row.loadingFood ? (
            <Skeleton className="h-4 w-32" />
          ) : row.food ? (
            <p className="text-xs text-text-soft">
              Base Supabase :{" "}
              <span className="font-mono text-text">
                {row.food.name ?? row.food.nom}
              </span>
              {macros ? (
                <span className="ml-2 font-mono text-muted">
                  {Math.round(macros.calories)} kcal · P{Math.round(macros.protein)} · G
                  {Math.round(macros.carbs)} · L{Math.round(macros.fats)}
                </span>
              ) : null}
            </p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-warning">Aucune correspondance trouvée</p>
              {foodSearchQuery.data && foodSearchQuery.data.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {foodSearchQuery.data.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onFoodChange(f)}
                      className="rounded border border-border bg-surface px-2 py-0.5 text-[10px] hover:border-border-strong hover:text-text"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="mt-1 rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-danger"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
