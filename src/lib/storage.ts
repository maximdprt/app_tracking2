import { supabase } from "@/lib/supabase";

const MEAL_PHOTOS_BUCKET = "meal-photos";

export async function uploadMealPhoto(userId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const filePath = `${userId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage.from(MEAL_PHOTOS_BUCKET).upload(filePath, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
}
