import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { FoodItem } from "@/types/domain";

type Client = SupabaseClient<Database>;

/** Retire les caractères qui cassent les motifs `.ilike.%…%` ou le parseur `.or()` PostgREST */
function safeIlike(text: string): string {
  return text
    .trim()
    .replace(/[%_,()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function searchFoods(
  client: Client,
  query: string,
  limit = 20,
): Promise<FoodItem[]> {
  const q = safeIlike(query);
  if (q.length === 0) return [];
  const { data, error } = await client
    .from("food_items")
    .select("*")
    .or(`name.ilike.%${q}%,nom.ilike.%${q}%`)
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as FoodItem[];
}

/**
 * Associe un libellé IA au meilleur aliment de `food_items`.
 * Stratégie par priorité décroissante :
 *  1. Correspondance exacte (insensible à la casse)
 *  2. Libellé complet en sous-chaîne
 *  3. Premier token significatif (> 3 caractères) en sous-chaîne
 *  4. Tokens suivants, du plus long au plus court
 */
export async function findBestFoodMatch(
  client: Client,
  aiLabel: string,
): Promise<FoodItem | null> {
  const raw = safeIlike(aiLabel);
  if (!raw) return null;

  // 1. Exact match
  const exact = await client
    .from("food_items")
    .select("*")
    .or(`name.ilike.${raw},nom.ilike.${raw}`)
    .limit(1);
  if (!exact.error && exact.data && exact.data.length > 0) {
    return exact.data[0] as FoodItem;
  }

  // 2. Full label substring, then individual tokens (longest first)
  const tokens = raw
    .split(/[\s,;-]+/)
    .map(safeIlike)
    .filter((w) => w.length > 3);

  // Deduplicate preserving order
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const t of [raw, ...tokens.sort((a, b) => b.length - a.length)]) {
    const k = t.toLowerCase();
    if (!seen.has(k) && t.length > 0) { seen.add(k); terms.push(t); }
  }

  for (const term of terms) {
    const { data, error } = await client
      .from("food_items")
      .select("*")
      .or(`name.ilike.%${term}%,nom.ilike.%${term}%`)
      .limit(5);
    if (error) throw error;
    if (data && data.length > 0) return data[0] as FoodItem;
  }

  return null;
}

/** Pour chaque ingrédient détecté par l'IA, résout une ligne `food_items` (ou null). */
export async function matchIngredientLabelsToFoodItems(
  client: Client,
  labels: string[],
): Promise<(FoodItem | null)[]> {
  return Promise.all(labels.map((label) => findBestFoodMatch(client, label)));
}
