/**
 * Server-only wrapper for Mistral API.
 * NEVER import from a Client Component.
 */

const MISTRAL_API = "https://api.mistral.ai/v1/chat/completions";
const VISION_MODEL = "pixtral-large-latest";
const MODEL = "mistral-large-latest";

const SYSTEM_PROMPT = `Tu es un coach sportif et nutritionnel professionnel.
Tu analyses uniquement les données fournies, sans en inventer.
Tu ne donnes jamais de diagnostic médical.
Tes recommandations sont prudentes, simples, actionnables.
Tu écris en français, ton ton est motivant mais factuel.
Tu réponds en 4-6 phrases maximum sauf demande contraire.`;

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
            { type: "image_url", image_url: `data:${mimeType};base64,${imageBase64}` },
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
  const parsed = JSON.parse(cleaned) as MealAnalysisResult;
  if (!Array.isArray(parsed.ingredients)) throw new Error("Réponse IA invalide");
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

export async function streamCoach(
  messages: MistralMessage[],
  context: Record<string, unknown>,
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY missing");

  const fullMessages: MistralMessage[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\nContexte utilisateur (7 derniers jours): ${JSON.stringify(context)}`,
    },
    ...messages,
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
