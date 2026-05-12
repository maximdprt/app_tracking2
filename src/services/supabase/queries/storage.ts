import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function uploadMealPhoto(
  client: Client,
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await client.storage
    .from("meal-photos")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export async function getMealPhotoUrl(client: Client, path: string): Promise<string | null> {
  const { data } = await client.storage
    .from("meal-photos")
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
