import { uploadMealPhoto as uploadMealPhotoFromLib } from "@/src/lib/storage";

// TODO: add retry policy + compression before upload.
export async function uploadMealPhoto(userId: string, photoUri: string): Promise<string> {
  return uploadMealPhotoFromLib(userId, photoUri);
}
