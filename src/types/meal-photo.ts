import type { DetectedIngredient } from "@/services/ai/mistral";
import type { FoodItem } from "@/types/domain";

/** Réponse de POST /api/ai/meal-photo : détection IA + ligne `food_items` Supabase quand trouvée */
export type MealPhotoIngredientRow = DetectedIngredient & {
  food_item: FoodItem | null;
};

export interface MealPhotoAnalysisApiResponse {
  description: string;
  ingredients: MealPhotoIngredientRow[];
}
