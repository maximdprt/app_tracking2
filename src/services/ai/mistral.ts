/**
 * Server-only wrapper for Mistral API.
 * NEVER import from a Client Component.
 */

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

export async function analyzeMealPhoto(
  imageBase64: string,
  mimeType: string,
): Promise<MealAnalysisResult> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY missing");

  const systemPrompt = `Tu es un nutritionniste expert qui analyse des photos de repas.
Tu identifies UNIQUEMENT les ingrédients visibles avec leur nom français standard (ex: "Poulet blanc", "Riz basmati", "Brocoli", "Huile d'olive").
Tu estimes une quantité en grammes pour chaque ingrédient en te basant sur la taille apparente dans l'assiette.
Tu retournes UNIQUEMENT un JSON strict, sans markdown, sans backticks, sans commentaire.
Schéma:
{
  "description": "courte phrase descriptive du plat",
  "ingredients": [
    {"name": "Poulet blanc", "estimatedGrams": 150, "category": "protein", "confidence": 0.9}
  ]
}
Catégories autorisées: protein, carbs, fats, vegetables, fruits, dairy, extras.
Si tu ne reconnais pas un aliment, n'invente pas — omets-le.`;

  const response = await fetch(MISTRAL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: VISION_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
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

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mistral vision error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data?.choices?.[0]?.message?.content ?? "{}";
  const cleaned = content.replace(/```json|```/g, "").trim();
  let parsed: MealAnalysisResult;
  try {
    parsed = JSON.parse(cleaned) as MealAnalysisResult;
  } catch {
    throw new Error("Réponse IA illisible (JSON invalide)");
  }
  if (!Array.isArray(parsed.ingredients)) throw new Error("Réponse IA invalide : pas de liste d'ingrédients");
  if (typeof parsed.description !== "string") {
    parsed.description = "";
  }
  return parsed;
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
