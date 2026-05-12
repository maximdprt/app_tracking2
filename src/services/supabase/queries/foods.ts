import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { FoodItem } from "@/types/domain";

export interface CustomFood {
  id: string;
  user_id: string;
  nom: string;
  calories_100g: number;
  proteines_100g: number;
  glucides_100g: number;
  lipides_100g: number;
  sucres_100g: number;
  fibres_100g: number;
  sel_100g: number;
  created_at: string;
}

type Client = SupabaseClient<Database>;
// Tables added in migrations 0007+ not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Untyped = { from: (t: string) => any; rpc: (fn: string, args?: any) => any };

/** Échappe %, _ et \ pour des motifs ILIKE corrects (sinon ils agissent comme wildcards SQL). */
function escapeIlike(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/** Nettoie la requête utilisateur / libellé IA pour éviter les motifs ILIKE vides ou trop permissifs */
function safeSearchToken(text: string): string {
  return text
    .trim()
    .replace(/[%_,()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Colonne absente (table recréée sans `name` / `nom`, cache PostgREST, etc.) */
function isMissingColumnError(err: PostgrestError | null): boolean {
  if (!err) return false;
  const msg = err.message ?? "";
  return (
    err.code === "42703" ||
    err.code === "PGRST204" ||
    /does not exist/i.test(msg) ||
    /schema cache/i.test(msg)
  );
}

function dedupeById(rows: FoodItem[]): FoodItem[] {
  const seen = new Set<string>();
  const out: FoodItem[] = [];
  for (const r of rows) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

/**
 * Recherche sur `name`, puis sur `nom` si la colonne existe — fusion et dédoublonnage.
 * N'utilise pas `.or(\`…\`)` en chaîne brute : les espaces cassent le parseur PostgREST.
 */
export async function searchFoods(
  client: Client,
  query: string,
  limit = 20,
): Promise<FoodItem[]> {
  const q = safeSearchToken(query);
  if (q.length === 0) return [];

  const pattern = `%${escapeIlike(q)}%`;

  let merged: FoodItem[] = [];

  const byName = await client.from("food_items").select("*").ilike("name", pattern).limit(limit);
  if (byName.error) {
    if (!isMissingColumnError(byName.error)) throw byName.error;
  } else {
    merged = [...((byName.data ?? []) as FoodItem[])];
  }

  const byNom = await client.from("food_items").select("*").ilike("nom", pattern).limit(limit);

  if (byNom.error) {
    if (!isMissingColumnError(byNom.error)) throw byNom.error;
  } else if (byNom.data?.length) {
    merged = dedupeById([...merged, ...(byNom.data as FoodItem[])]);
  }

  return merged.slice(0, limit);
}

async function firstMatchBySubstring(client: Client, term: string, limit: number): Promise<FoodItem | null> {
  const pattern = `%${escapeIlike(term)}%`;

  const byName = await client.from("food_items").select("*").ilike("name", pattern).limit(limit);

  if (byName.error) {
    if (!isMissingColumnError(byName.error)) throw byName.error;
  } else {
    const nameRows = (byName.data ?? []) as FoodItem[];
    if (nameRows.length > 0) return nameRows[0]!;
  }

  const byNom = await client.from("food_items").select("*").ilike("nom", pattern).limit(limit);

  if (byNom.error) {
    if (isMissingColumnError(byNom.error)) return null;
    throw byNom.error;
  }

  const nomRows = (byNom.data ?? []) as FoodItem[];
  return nomRows.length > 0 ? nomRows[0]! : null;
}

async function firstExactCaseInsensitive(client: Client, raw: string): Promise<FoodItem | null> {
  const lit = escapeIlike(raw);

  const byName = await client.from("food_items").select("*").ilike("name", lit).limit(1);

  if (byName.error) {
    if (!isMissingColumnError(byName.error)) throw byName.error;
  } else {
    const n = (byName.data ?? []) as FoodItem[];
    if (n.length > 0) return n[0]!;
  }

  const byNom = await client.from("food_items").select("*").ilike("nom", lit).limit(1);

  if (byNom.error) {
    if (isMissingColumnError(byNom.error)) return null;
    throw byNom.error;
  }

  const rows = (byNom.data ?? []) as FoodItem[];
  return rows.length > 0 ? rows[0]! : null;
}

/**
 * Associe un libellé IA au meilleur aliment de `food_items`.
 * 1. Égalité « naturelle » via ILIKE sans wildcard (chaîne échappée)
 * 2. Sous-chaîne sur le libellé complet puis tokens (plus long → plus court)
 */
export async function findBestFoodMatch(
  client: Client,
  aiLabel: string,
): Promise<FoodItem | null> {
  const raw = safeSearchToken(aiLabel);
  if (!raw) return null;

  const exact = await firstExactCaseInsensitive(client, raw);
  if (exact) return exact;

  const tokens = raw
    .split(/[\s,;-]+/)
    .map(safeSearchToken)
    .filter((w) => w.length > 3);

  const seen = new Set<string>();
  const terms: string[] = [];
  for (const t of [raw, ...tokens.sort((a, b) => b.length - a.length)]) {
    const k = t.toLowerCase();
    if (!seen.has(k) && t.length > 0) {
      seen.add(k);
      terms.push(t);
    }
  }

  for (const term of terms) {
    const hit = await firstMatchBySubstring(client, term, 5);
    if (hit) return hit;
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

// ─── RPC full-text search (migration 0007) ────────────────────────────────────

/**
 * Recherche via la RPC `search_food_items` (pg_trgm + tsvector français).
 * Retombe sur `searchFoods` (ilike) si la fonction RPC n'existe pas encore.
 */
export async function searchFoodsRPC(
  client: Client,
  query: string,
  limit = 20,
): Promise<FoodItem[]> {
  const q = safeSearchToken(query);
  if (q.length < 2) return [];

  const { data, error } = await (client as unknown as Untyped).rpc("search_food_items", {
    query: q,
    limit_n: limit,
  });

  if (error) {
    // RPC pas encore appliquée → fallback silencieux
    if (error.code === "PGRST202" || /does not exist/i.test(error.message)) {
      return searchFoods(client, query, limit);
    }
    throw error;
  }

  return (data ?? []) as unknown as FoodItem[];
}

// ─── Favoris utilisateur ──────────────────────────────────────────────────────

export async function getUserFavorites(
  client: Client,
  userId: string,
): Promise<FoodItem[]> {
  const { data, error } = await (client as unknown as Untyped)
    .from("user_food_favorites")
    .select("food_item_id, food_items(*)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false })
    .limit(50);

  if (error) {
    if (error.code === "42P01" || /does not exist/i.test(error.message)) return [];
    throw error;
  }

  return ((data ?? []) as unknown[])
    .map((row) => (row as { food_items: FoodItem }).food_items)
    .filter((fi): fi is FoodItem => Boolean(fi));
}

export async function addFavorite(
  client: Client,
  userId: string,
  foodItemId: string,
): Promise<void> {
  const { error } = await (client as unknown as Untyped)
    .from("user_food_favorites")
    .upsert({ user_id: userId, food_item_id: foodItemId });
  if (error) throw error;
}

export async function removeFavorite(
  client: Client,
  userId: string,
  foodItemId: string,
): Promise<void> {
  const { error } = await (client as unknown as Untyped)
    .from("user_food_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("food_item_id", foodItemId);
  if (error) throw error;
}

// ─── Aliments récents ─────────────────────────────────────────────────────────

export async function getRecentFoodItems(
  client: Client,
  userId: string,
  limit = 10,
): Promise<FoodItem[]> {
  const { data, error } = await client
    .from("meal_ingredients")
    .select("food_item_id, created_at, food_items(*)")
    .eq("user_id", userId)
    .not("food_item_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  if (error) {
    if (error.code === "42P01") return [];
    throw error;
  }

  const seen = new Set<string>();
  const out: FoodItem[] = [];
  for (const row of data ?? []) {
    const fi = (row as unknown as { food_items: FoodItem }).food_items;
    if (!fi || seen.has(fi.id)) continue;
    seen.add(fi.id);
    out.push(fi);
    if (out.length >= limit) break;
  }
  return out;
}

// ─── Aliments personnalisés ───────────────────────────────────────────────────

export async function getUserCustomFoods(
  client: Client,
  userId: string,
): Promise<CustomFood[]> {
  const { data, error } = await (client as unknown as Untyped)
    .from("user_custom_foods")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01" || /does not exist/i.test(error.message)) return [];
    throw error;
  }

  return (data ?? []) as unknown as CustomFood[];
}

export async function createCustomFood(
  client: Client,
  food: Omit<CustomFood, "id" | "created_at">,
): Promise<CustomFood> {
  const { data, error } = await (client as unknown as Untyped)
    .from("user_custom_foods")
    .insert(food)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as CustomFood;
}

/** Convertit un CustomFood en pseudo-FoodItem utilisable dans le panier. */
export function customFoodToFoodItem(cf: CustomFood): FoodItem {
  return {
    id: `custom_${cf.id}`,
    nom: cf.nom,
    name: cf.nom,
    calories_100g: cf.calories_100g,
    proteines_100g: cf.proteines_100g,
    glucides_100g: cf.glucides_100g,
    lipides_100g: cf.lipides_100g,
    sucres_100g: cf.sucres_100g,
    fibres_100g: cf.fibres_100g,
    sel_100g: cf.sel_100g,
    source: "USER_CUSTOM",
  } as unknown as FoodItem;
}
