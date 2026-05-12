import { NextResponse } from "next/server";
import { createClient } from "@/services/supabase/server";
import { analyzeMealPhoto } from "@/services/ai/mistral";
import { matchIngredientLabelsToFoodItems } from "@/services/supabase/queries/foods";
import type { MealPhotoAnalysisApiResponse } from "@/types/meal-photo";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("photo");
    if (!(file instanceof File)) return NextResponse.json({ error: "No photo" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Photo > 8MB" }, { status: 413 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 415 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const ai = await analyzeMealPhoto(base64, file.type);

    const matches = await matchIngredientLabelsToFoodItems(
      supabase,
      ai.ingredients.map((i) => i.name),
    );

    const payload: MealPhotoAnalysisApiResponse = {
      description: ai.description,
      ingredients: ai.ingredients.map((ing, index) => ({
        ...ing,
        food_item: matches[index] ?? null,
      })),
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[api/ai/meal-photo]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
