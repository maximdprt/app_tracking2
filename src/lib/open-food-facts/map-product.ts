import type { FoodItem } from "@/types/domain";

type Nutriments = Record<string, number | string | undefined | null>;

function num(n: unknown, fallback = 0): number {
  if (typeof n === "number" && Number.isFinite(n)) return n;
  if (typeof n === "string") {
    const v = parseFloat(n.replace(",", "."));
    return Number.isFinite(v) ? v : fallback;
  }
  return fallback;
}

/**
 * Construit un enregistrement compatible `FoodItem` pour l’aperçu / le panier (id externe, non persisté en base).
 */
export function openFoodFactsProductToFoodItem(code: string, product: unknown): FoodItem | null {
  if (!product || typeof product !== "object") return null;
  const p = product as {
    product_name_fr?: string;
    product_name?: string;
    nutriments?: Nutriments;
  };
  const nut = p.nutriments ?? {};

  const kcal =
    num(nut["energy-kcal_100g"]) ||
    (num(nut.energy_100g) > 0 ? num(nut.energy_100g) / 4.184 : 0);

  const name = (p.product_name_fr ?? p.product_name ?? "Produit scanné").trim() || "Produit scanné";
  const fibre = num(nut.fiber_100g);
  const iso = new Date().toISOString();

  return {
    id: `OPENFOODFACTS:${code}`,
    aliases: [],
    nom: name,
    name,
    category: "openfoodfacts",
    source: "OPENFOODFACTS",
    calories_100g: kcal,
    calories_per_100g: kcal,
    proteines_100g: num(nut.proteins_100g),
    protein_per_100g: num(nut.proteins_100g),
    glucides_100g: num(nut.carbohydrates_100g),
    carbs_per_100g: num(nut.carbohydrates_100g),
    lipides_100g: num(nut.fat_100g),
    fats_per_100g: num(nut.fat_100g),
    sucres_100g: num(nut.sugars_100g),
    sugar_per_100g: num(nut.sugars_100g),
    fibres_100g: fibre,
    fiber_per_100g: fibre,
    sel_100g: num(nut.salt_100g),
    salt_per_100g: num(nut.salt_100g),
    created_at: iso,
    updated_at: iso,
  };
}
