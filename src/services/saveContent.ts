import { supabase } from "../lib/supabase";

export async function saveContent(siteId: string, data: any) {
  if (!supabase || typeof supabase.from !== "function") {
    return { error: new Error("Supabase not configured - check your .env file") } as any;
  }
  return await supabase
    .from("site_content")
    .upsert({
      site_id: siteId,
      data,
      updated_at: new Date().toISOString(),
    });
}