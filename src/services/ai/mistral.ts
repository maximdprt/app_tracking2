/**
 * Server-only wrapper for Mistral API.
 * NEVER import from a Client Component.
 */

import { mealPhotoAnalysisSchema } from "./meal-photo-schema";
import type { MealPhotoAnalysis } from "./meal-photo-schema";

const MISTRAL_API = "https://api.mistral.ai/v1/chat/completions";
const VISION_MODEL = "pixtral-large-latest";
const MODEL = "mistral-large-latest";

/** Token budget conservateur : on garde les N derniers échanges pour rester < 8k tokens. */
const MAX_HISTORY_TURNS = 12;

const SYSTEM_PROMPT = `Tu es LIFT Coach, un assistant coach sportif et nutritionnel professionnel.

## Règles absolues
- Tu analyses UNIQUEMENT les données fournies dans le contexte JSON. Tu n'inventes aucune valeur.
- Tu ne fournis JAMAIS de diagnostic médical ni d'ordonnance.
- Tu réponds TOUJOURS en français, ton ton est motivant, direct et factuel.

## Format de tes réponses
- Réponse courte par défaut : 3-5 phrases, sauf si l'utilisateur demande un plan détaillé.
- Pour les plans ou analyses longues : utilise des puces ou sections courtes.
- Si une donnée manque dans le contexte, dis-le clairement plutôt qu'inventer.

## Domaines de compétence
- Nutrition : calories, macros (protéines/glucides/lipides), timing des repas, déficit/surplus calorique.
- Entraînement : volume, intensité, progression, récupération, déload.
- Habitudes : sommeil, hydratation, pas, stress.
- Progression : e1RM, records personnels, tendances hebdomadaires.

## Ton style
- Utilise les données du contexte pour personnaliser chaque réponse.
- Quand l'utilisateur est en déficit calorique, félicite-le et ajuste les conseils en conséquence.
- Quand il y a des sessions récentes, commente la progression visible.
- Sois motivant mais honnête sur les marges d'amélioration.`;

export interface MistralMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface MistralChoice {
  message: { role: string; content: string };
}

interface MistralResponse {
  choices: MistralChoice[];
}

export interface DetectedIngredient {
  name: string;
  estimatedGrams: number;
  category: string | null;
  confidence: number;
}

export interface MealAnalysisResult {
  ingredients: DetectedIngredient[];
  description: string;
}

/** Adapte le nouveau format (MealPhotoAnalysis) vers l'ancien type (MealAnalysisResult)
 *  pour garantir la rétrocompat avec meal-photo/route.ts */
function adaptToLegacy(analysis: MealPhotoAnalysis): MealAnalysisResult {
  if (!analysis.is_food) {
    throw new Error(`Cette photo n'est pas un plat reconnu. ${analysis.reason}`);
  }
  return {
    description: analysis.description,
    ingredients: analysis.ingredients.map((ing) => ({
      name: ing.name_fr,
      estimatedGrams: ing.weight_g_estimate,
      category: null,
      confidence: ing.confidence,
    })),
  };
}

const VISION_SYSTEM_PROMPT = `Tu es un expert en nutrition et en analyse visuelle d'aliments. Ta mission : analyser une photo de plat et identifier précisément chaque aliment visible avec une estimation du poids cuit en grammes.

## RÔLE ET PHILOSOPHIE

Tu ne fournis PAS les valeurs caloriques toi-même. Tu identifies les aliments et estimes les quantités. L'application croisera tes résultats avec une base CIQUAL ANSES / USDA SR Legacy pour calculer les macros exactes.

Ta valeur ajoutée est la précision de l'identification et l'honnêteté de l'estimation. Tu DOIS exprimer ton incertitude — un nombre faussement précis est pire qu'une fourchette honnête.

## IDENTIFICATION

- Liste UNIQUEMENT les aliments comestibles présents dans l'assiette. Ignore les éléments décoratifs.
- Donne le nom français le plus précis possible (ex: "Steak de bœuf grillé" pas "viande").
- Distingue méthode de cuisson : cru / vapeur / bouilli / rôti / grillé / frit / poêlé / pané.
- Si tu vois de la matière grasse ajoutée (huile, beurre, sauce), liste-la séparément.

## ESTIMATION DU POIDS (cuit, partie comestible uniquement)

Ancres visuelles par priorité :
1. Objets de référence : fourchette ~20cm, assiette principale 26-28cm, assiette entrée 19-22cm
2. Repères : œuf ≈ 50g, tranche pain de mie ≈ 30g, amande ≈ 1.2g, olive ≈ 4g
3. Volumétrie : 100ml riz cuit ≈ 75g, 100ml pâtes cuites ≈ 85g, 100ml salade ≈ 25g

Pour chaque aliment fournis weight_g_estimate (centrale), weight_g_min et weight_g_max (±25-35%), confidence 0.0-1.0 :
- 0.85+ : référence d'échelle claire visible
- 0.65-0.85 : assiette standard supposée, aliment bien visible
- 0.45-0.65 : aliment partiellement caché ou ambigu
- < 0.45 : très incertain

## FORMAT JSON STRICT

Réponds UNIQUEMENT par JSON valide, sans markdown, sans backticks, sans préambule :

{
  "is_food": true,
  "image_quality": "good",
  "reference_scale_detected": "plate",
  "plate_diameter_cm_estimate": 26,
  "portion_count": 1,
  "meal_type_guess": "lunch",
  "ingredients": [
    {
      "name_fr": "Steak de bœuf grillé",
      "name_en": "Grilled beef steak",
      "cooking_method": "grillé",
      "weight_g_estimate": 180,
      "weight_g_min": 140,
      "weight_g_max": 230,
      "confidence": 0.7,
      "search_keywords": ["bœuf", "entrecôte", "grillé"],
      "notes": "Marques de grill visibles"
    }
  ],
  "description": "Plat équilibré protéines + féculent + légume vert.",
  "total_estimated_weight_g": 430,
  "overall_confidence": 0.72
}

Si la photo n'est PAS un plat : {"is_food": false, "reason": "description courte"}`;

async function callMistralVision(
  imageBase64: string,
  mimeType: string,
  apiKey: string,
): Promise<Response> {
  return fetch(MISTRAL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: VISION_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: VISION_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyse cette photo de repas." },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        },
      ],
    }),
  });
}

export async function analyzeMealPhoto(
  imageBase64: string,
  mimeType: string,
): Promise<MealAnalysisResult> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY missing");

  let response = await callMistralVision(imageBase64, mimeType, apiKey);

  // Retry once on 429 or 5xx with 1s backoff
  if (response.status === 429 || response.status >= 500) {
    await new Promise((r) => setTimeout(r, 1000));
    response = await callMistralVision(imageBase64, mimeType, apiKey);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mistral vision error ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  const cleaned = content.replace(/```json|```/g, "").trim();

  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    throw new Error("Réponse IA illisible (JSON invalide)");
  }

  const result = mealPhotoAnalysisSchema.safeParse(raw);
  if (!result.success) {
    console.error("[mistral] meal photo parse error:", result.error.flatten());
    throw new Error("Réponse IA non conforme au schéma attendu");
  }

  return adaptToLegacy(result.data);
}

export async function generateSummary(context: Record<string, unknown>): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY missing");

  const userPrompt = `Analyse globale lifestyle pour aujourd'hui.
Données: ${JSON.stringify(context)}.
Fais une synthèse sport + nutrition + habitudes avec une priorité unique.
Si certaines données sont absentes, indique-le clairement.`;

  const response = await fetch(MISTRAL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mistral error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as MistralResponse;
  return data.choices[0]?.message.content ?? "Résumé non disponible.";
}

/**
 * Construit le system prompt enrichi avec le contexte utilisateur.
 * Formate le contexte de façon lisible pour le LLM.
 */
function buildSystemPrompt(context: Record<string, unknown>): string {
  const ctx = context as {
    date?: string;
    profile?: {
      age?: number; sex?: string; height?: number; weight?: number;
      goal?: string; goal_duration_weeks?: number;
    };
    targets?: { calories?: number; protein?: number; carbs?: number; fats?: number };
    today?: {
      consumed?: { calories: number; protein: number; carbs: number; fats: number };
      meals_count?: number; sleep_hours?: number; sleep_quality?: number; steps?: number;
    };
    recent_sessions?: { date: string; name?: string; status: string; duration?: number }[];
    weight_history?: { date: string; weight: number }[];
  };

  const profile = ctx.profile ?? {};
  const targets = ctx.targets ?? {};
  const today = ctx.today ?? {};
  const consumed = today.consumed ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const calorieBalance = targets.calories
    ? Math.round(consumed.calories - (targets.calories ?? 0))
    : null;

  const weightTrend = (() => {
    const wh = ctx.weight_history ?? [];
    if (wh.length < 2) return null;
    const first = wh[0]!.weight;
    const last = wh[wh.length - 1]!.weight;
    return Math.round((last - first) * 10) / 10;
  })();

  const sessions = ctx.recent_sessions ?? [];
  const completedSessions = sessions.filter((s) => s.status === "completed");

  return `${SYSTEM_PROMPT}

## Contexte utilisateur au ${ctx.date ?? "aujourd'hui"}

### Profil
- Âge: ${profile.age ?? "?"} ans | Sexe: ${profile.sex ?? "?"} | Taille: ${profile.height ?? "?"}cm | Poids: ${profile.weight ?? "?"}kg
- Objectif: ${profile.goal ?? "?"} ${profile.goal_duration_weeks ? `(${profile.goal_duration_weeks} semaines)` : ""}

### Nutrition aujourd'hui
- Objectif: ${targets.calories ?? "?"}kcal (P:${targets.protein ?? "?"}g / G:${targets.carbs ?? "?"}g / L:${targets.fats ?? "?"}g)
- Consommé: ${Math.round(consumed.calories)}kcal (P:${Math.round(consumed.protein)}g / G:${Math.round(consumed.carbs)}g / L:${Math.round(consumed.fats)}g)
- Balance: ${calorieBalance !== null ? (calorieBalance > 0 ? `+${calorieBalance}` : calorieBalance) + "kcal" : "inconnue"} | ${today.meals_count ?? 0} repas logués

### Habitudes
- Sommeil: ${today.sleep_hours ? `${today.sleep_hours}h (qualité: ${today.sleep_quality ?? "?"}/ 10)` : "non renseigné"}
- Pas: ${today.steps ? today.steps.toLocaleString("fr-FR") : "non renseigné"}

### Entraînement (30 derniers jours)
- Séances terminées: ${completedSessions.length}
${completedSessions.slice(0, 3).map((s) => `- ${s.date}: ${s.name ?? "Séance libre"} (${s.duration ?? "?"}min)`).join("\n")}

### Poids (tendance 30j)
${weightTrend !== null ? `Evolution: ${weightTrend > 0 ? "+" : ""}${weightTrend}kg` : "Données insuffisantes"}`;
}

export async function streamCoach(
  messages: MistralMessage[],
  context: Record<string, unknown>,
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY missing");

  // Trim history to avoid token overflow (keep last N turns, always full pairs)
  const trimmedMessages = messages.length > MAX_HISTORY_TURNS
    ? messages.slice(messages.length - MAX_HISTORY_TURNS)
    : messages;

  const fullMessages: MistralMessage[] = [
    {
      role: "system",
      content: buildSystemPrompt(context),
    },
    ...trimmedMessages,
  ];

  const response = await fetch(MISTRAL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      stream: true,
      messages: fullMessages,
    }),
  });

  if (!response.ok || !response.body) {
    const text = response.body ? await response.text() : "";
    throw new Error(`Mistral stream error ${response.status}: ${text}`);
  }

  // Transform SSE chunks → plain text stream
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const parsed = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[];
              };
              const chunk = parsed.choices?.[0]?.delta?.content;
              if (chunk) controller.enqueue(encoder.encode(chunk));
            } catch {
              // ignore non-JSON heartbeat
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}
