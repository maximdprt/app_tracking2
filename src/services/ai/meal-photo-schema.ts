import { z } from "zod";

export const detectedIngredientSchema = z.object({
  name_fr: z.string().min(1),
  name_en: z.string().min(1),
  cooking_method: z.string().default("non spécifié"),
  weight_g_estimate: z.number().positive(),
  weight_g_min: z.number().positive(),
  weight_g_max: z.number().positive(),
  confidence: z.number().min(0).max(1),
  search_keywords: z.array(z.string()).min(1).max(6),
  notes: z.string().nullable().default(""),
});

export const mealPhotoAnalysisSchema = z.discriminatedUnion("is_food", [
  z.object({
    is_food: z.literal(false),
    reason: z.string(),
  }),
  z.object({
    is_food: z.literal(true),
    image_quality: z.enum(["good", "medium", "poor"]).default("medium"),
    reference_scale_detected: z.string().default("none"),
    plate_diameter_cm_estimate: z.number().positive().nullable().default(null),
    portion_count: z.number().int().positive().default(1),
    meal_type_guess: z
      .enum(["breakfast", "lunch", "dinner", "snack", "drink", "unknown"])
      .default("unknown"),
    ingredients: z.array(detectedIngredientSchema).min(1),
    description: z.string().default(""),
    total_estimated_weight_g: z.number().positive(),
    overall_confidence: z.number().min(0).max(1),
  }),
]);

export type MealPhotoAnalysis = z.infer<typeof mealPhotoAnalysisSchema>;
export type DetectedIngredientNew = z.infer<typeof detectedIngredientSchema>;
