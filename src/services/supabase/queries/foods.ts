import type { SupabaseClient } from "@supabase/supabase-js";
import type { PostgrestError } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { FoodItem } from "@/types/domain";

type Client = SupabaseClient<Database>;

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
