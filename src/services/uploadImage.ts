import { supabase } from "../lib/supabase";

export async function uploadImage(
  siteId: string,
  file: File
) {
  if (!supabase || typeof supabase.storage !== "object") {
    const err = new Error("Supabase not configured - check your .env file");
    throw err;
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