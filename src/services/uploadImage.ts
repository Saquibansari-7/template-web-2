import { supabase } from "../lib/supabase";

export async function uploadImage(
  siteId: string,
  file: File
) {
  const path = `${siteId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("sites")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("sites")
    .getPublicUrl(path);

  return data.publicUrl;
}
