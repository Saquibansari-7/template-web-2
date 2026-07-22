import { supabase } from "../lib/supabase";

export async function uploadImage(
  siteId: string,
  file: File
) {
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
  console.log('uploadImage - supabaseUrl:', supabaseUrl);
  console.log('uploadImage - siteId:', siteId);
  console.log('uploadImage - file:', file.name, file.size);

  if (!supabase || typeof supabase.storage !== "object") {
    const err = new Error("Supabase not configured - check your .env file");
    console.error('uploadImage - error:', err);
    throw err;
  }

  const path = `${siteId}/${Date.now()}-${file.name}`;
  console.log('uploadImage - path:', path);

  const { error, data } = await supabase.storage
    .from("sites")
    .upload(path, file);

  if (error) {
    console.error('uploadImage - storage error:', error);
    throw error;
  }

  console.log('uploadImage - upload success, data:', data);

  const { data: publicData } = supabase.storage
    .from("sites")
    .getPublicUrl(path);

  console.log('uploadImage - publicUrl:', publicData.publicUrl);

  return publicData.publicUrl;
}