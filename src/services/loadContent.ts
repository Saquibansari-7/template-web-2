import { supabase } from "../lib/supabase";

export async function loadContent(siteId: string) {
  if (!supabase || typeof supabase.from !== "function") {
    return null;
  }
  const { data } = await supabase
    .from("site_content")
    .select("data")
    .eq("site_id", siteId)
    .single();

  return data?.data;
}