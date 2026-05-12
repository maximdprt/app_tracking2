import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { FoodItem } from "@/types/domain";

type Client = SupabaseClient<Database>;

/** Retire les caractères qui cassent les motifs `.ilike.%…%` ou le parseur `.or()` PostgREST */
function safeIlikeSubstring(text: string): string {
  return text
    .trim()
    .replace(/[%_,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function searchFoods(
  client: Client,
  query: string,
  limit = 20,
): Promise<FoodItem[]> {
  const q = safeIlikeSubstring(query);
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
 * Associe un libellé issu de l'IA au meilleur aliment de `food_items` (colonnes name + nom).
 * Stratégie : libellé complet, puis mots significatifs (> 2 caractères).
 */
export async function findBestFoodMatch(
  client: Client,
  aiLabel: string,
): Promise<FoodItem | null> {
  const raw = safeIlikeSubstring(aiLabel);
  if (!raw) return null;

  const tokens = raw
    .split(/[\s,;]+/)
    .map((w) => safeIlikeSubstring(w))
    .filter((w) => w.length > 2);

  const candidates = [raw, ...tokens];
  const seen = new Set<string>();
  const unique = candidates.filter((c) => {
    const k = c.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  for (const term of unique) {
    if (term.length === 0) continue;
    const rows = await client
      .from("food_items")
      .select("*")
      .or(`name.ilike.%${term}%,nom.ilike.%${term}%`)
      .limit(5);
    if (rows.error) throw rows.error;
    const list = rows.data as FoodItem[] | null;
    if (list && list.length > 0) return list[0]!;
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
