"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, CheckCircle2, Loader2, Plus, X } from "lucide-react";
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
import { useDebounce } from "@/hooks/useDebounce";
import { ROUTES } from "@/constants/routes";
import { toUserMessage } from "@/lib/errors";
import { macrosFromGrams, per100gMacrosFromFoodItem } from "@/utils/nutrition";
import { useDateStore } from "@/stores/useDateStore";
import type { MealPhotoAnalysisApiResponse } from "@/types/meal-photo";
import type { FoodItem, MealType } from "@/types/domain";

interface PhotoAnalyzerProps {
  mealType: MealType;
}

type Phase = "upload" | "analyzing" | "review";

interface IngredientRow {
  key: string;
  name: string;
  grams: number;
  estimatedGrams: number;
  confidence: number;
  food: FoodItem | null;
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
      toast.error("Photo trop lourde (max 8 MB)");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Fichier non supporté — choisis une image");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
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
        toast.warning("Aucun aliment détecté — essaie une photo plus claire ou utilise la recherche manuelle");
        setPhase("upload");
        return;
      }

      setAnalysisResult(result);
      setIngredients(
        result.ingredients.map((ing) => ({
          key: crypto.randomUUID(),
          name: ing.name,
          grams: ing.estimatedGrams,
          estimatedGrams: ing.estimatedGrams,
          confidence: ing.confidence,
          food: ing.food_item,
        })),
      );
      setPhase("review");
    } catch (err) {
      toast.error(toUserMessage(err));
      setPhase("upload");
    }
  }

  function updateIngredient(key: string, patch: Partial<Omit<IngredientRow, "key">>) {
    setIngredients((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeIngredient(key: string) {
    setIngredients((prev) => prev.filter((r) => r.key !== key));
  }

  function addManualIngredient() {
    setIngredients((prev) => [
      ...prev,
      { key: crypto.randomUUID(), name: "", grams: 100, estimatedGrams: 100, confidence: 1, food: null },
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié — reconnecte-toi");

      let photoPath: string | null = null;
      if (photoFile) {
        photoPath = await uploadMealPhoto(supabase, user.id, photoFile);
      }

      const mealIngredients = ingredients
        .filter((r): r is IngredientRow & { food: FoodItem } => r.food !== null && r.grams > 0)
        .map((row) => {
          const m = macrosFromGrams(row.grams, per100gMacrosFromFoodItem(row.food));
          return {
            user_id: user.id,
            food_item_id: row.food.id,
            custom_food_name: row.name || (row.food.name ?? row.food.nom ?? "Aliment"),
            grams: row.grams,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fats: m.fats,
          };
        });

      if (mealIngredients.length === 0) throw new Error("Aucun ingrédient valide à enregistrer");

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

  /* ── Phase: upload ─────────────────────────────────────────────── */
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
              <img src={photoPreview} alt="Aperçu" className="h-64 w-full object-cover" />
              <button
                type="button"
                aria-label="Supprimer la photo"
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
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

  /* ── Phase: analyzing ──────────────────────────────────────────── */
  if (phase === "analyzing") {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div>
            <p className="font-medium">Analyse en cours…</p>
            <p className="mt-1 text-sm text-text-soft">Je détecte les ingrédients dans ta photo</p>
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

  /* ── Phase: review ─────────────────────────────────────────────── */
  const validCount = ingredients.filter((r) => r.food && r.grams > 0).length;

  return (
    <div className="space-y-4">
      {photoPreview ? (
        <div className="overflow-hidden rounded-xl">
          <img src={photoPreview} alt="Repas analysé" className="h-40 w-full object-cover" />
        </div>
      ) : null}

      {analysisResult?.description ? (
        <p className="text-sm font-medium">{analysisResult.description}</p>
      ) : null}

      <div className="space-y-3">
        {ingredients.map((row) => (
          <IngredientCard
            key={row.key}
            row={row}
            onChange={(patch) => updateIngredient(row.key, patch)}
            onRemove={() => removeIngredient(row.key)}
          />
        ))}
      </div>

      <Button variant="secondary" onClick={addManualIngredient} className="w-full">
        <Plus className="h-4 w-4" />
        Ajouter un ingrédient manuellement
      </Button>

      {totals.calories > 0 ? (
        <Card>
          <div className="flex items-baseline justify-between">
            <span className="lift-label">Total estimé</span>
            <span className="lift-display-md lift-num">{Math.round(totals.calories)} kcal</span>
          </div>
          <p className="mt-1 lift-label">
            P {Math.round(totals.protein)}g · G {Math.round(totals.carbs)}g · L {Math.round(totals.fats)}g
          </p>
          <MacroBar protein={totals.protein} carbs={totals.carbs} fats={totals.fats} />
        </Card>
      ) : null}

      <Button
        size="lg"
        className="w-full"
        onClick={() => saveMutation.mutate()}
        loading={saveMutation.isPending}
        disabled={validCount === 0}
      >
        Enregistrer le repas
        {validCount > 0 ? ` (${validCount} ingrédient${validCount > 1 ? "s" : ""})` : ""}
      </Button>
    </div>
  );
}

/* ── IngredientCard ─────────────────────────────────────────────── */

interface IngredientCardProps {
  row: IngredientRow;
  onChange: (patch: Partial<Omit<IngredientRow, "key">>) => void;
  onRemove: () => void;
}

function IngredientCard({ row, onChange, onRemove }: IngredientCardProps) {
  const [localName, setLocalName] = useState(row.name);
  const [showSearch, setShowSearch] = useState(false);
  const debouncedName = useDebounce(localName, 400);

  // Sync parent name into local state when it changes externally (initial load)
  useEffect(() => {
    setLocalName(row.name);
  }, [row.name]);

  const foodSearchQuery = useQuery({
    queryKey: ["foods-search", debouncedName],
    enabled: showSearch && debouncedName.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
    queryFn: () => searchFoods(createClient(), debouncedName.trim(), 6),
  });

  const macros =
    row.food && row.grams > 0
      ? macrosFromGrams(row.grams, per100gMacrosFromFoodItem(row.food))
      : null;

  function commitName(value: string) {
    setLocalName(value);
    onChange({ name: value });
  }

  function selectFood(food: FoodItem) {
    onChange({ food });
    setShowSearch(false);
  }

  return (
    <Card>
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-2">
          {/* Name + grams row */}
          <div className="flex items-center gap-2">
            <Input
              value={localName}
              onChange={(e) => { setLocalName(e.target.value); onChange({ name: e.target.value }); }}
              placeholder="Nom de l'ingrédient"
              className="flex-1 text-sm"
            />
            <Input
              type="number"
              value={row.grams}
              onChange={(e) => onChange({ grams: Math.max(0, Number(e.target.value) || 0) })}
              min={0}
              max={2000}
              className="w-20 text-sm"
            />
            <span className="shrink-0 text-xs text-text-soft">g</span>
          </div>

          {/* Matched food info */}
          {row.food ? (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-surface px-2 py-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" />
                <span className="truncate text-[11px] text-text-soft">
                  {row.food.name ?? row.food.nom ?? "Aliment"}
                </span>
                {macros ? (
                  <span className="shrink-0 font-mono text-[10px] text-muted">
                    {Math.round(macros.calories)} kcal · P{Math.round(macros.protein)} · G{Math.round(macros.carbs)} · L{Math.round(macros.fats)}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => { onChange({ food: null }); setShowSearch(true); }}
                className="shrink-0 text-[10px] text-muted hover:text-text"
                aria-label="Changer l'aliment"
              >
                Changer
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-warning">Aucune correspondance trouvée</p>
                <button
                  type="button"
                  onClick={() => setShowSearch((v) => !v)}
                  className="text-[10px] text-primary hover:underline"
                >
                  {showSearch ? "Fermer" : "Rechercher"}
                </button>
              </div>
              {showSearch ? (
                <SearchDropdown
                  query={debouncedName}
                  results={foodSearchQuery.data}
                  loading={foodSearchQuery.isLoading}
                  onSelect={selectFood}
                  onQueryChange={commitName}
                />
              ) : null}
            </div>
          )}

          {/* Show search when user clicked "Changer" on a matched food */}
          {row.food && showSearch ? (
            <SearchDropdown
              query={debouncedName}
              results={foodSearchQuery.data}
              loading={foodSearchQuery.isLoading}
              onSelect={selectFood}
              onQueryChange={commitName}
            />
          ) : null}
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Supprimer cet ingrédient"
          className="mt-1 rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-danger"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function SearchDropdown({
  results,
  loading,
  onSelect,
  onQueryChange,
  query,
}: {
  query: string;
  results: FoodItem[] | undefined;
  loading: boolean;
  onSelect: (food: FoodItem) => void;
  onQueryChange: (q: string) => void;
}) {
  return (
    <div className="space-y-1 rounded-xl border border-border bg-surface p-2">
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Rechercher un aliment…"
        className="text-xs"
        autoFocus
      />
      {loading ? (
        <div className="space-y-1 pt-1">
          <Skeleton className="h-7" />
          <Skeleton className="h-7 w-4/5" />
        </div>
      ) : results && results.length > 0 ? (
        <div className="max-h-40 overflow-y-auto space-y-0.5 pt-1">
          {results.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-surface-2"
            >
              <span className="text-xs">{f.name ?? f.nom}</span>
              <span className="font-mono text-[10px] text-muted">
                {Math.round(per100gMacrosFromFoodItem(f).calories)} kcal/100g
              </span>
            </button>
          ))}
        </div>
      ) : query.trim().length >= 2 ? (
        <p className="py-2 text-center text-[11px] text-muted">Aucun résultat pour « {query} »</p>
      ) : null}
    </div>
  );
}
