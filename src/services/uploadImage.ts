import { supabase } from "../lib/supabase";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImage(
  siteId: string,
  file: File
) {
  if (!supabase || typeof supabase.storage !== "object") {
    const err = new Error("Supabase not configured - check your .env file");
    throw err;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image too large — please use a file under 2MB");
  }

  const path = `${siteId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("sites")
    .upload(path, file);

  if (error) {
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from("sites")
    .getPublicUrl(path);

  return publicData.publicUrl;
}