import { supabase } from "../lib/supabase";

export async function saveContent(siteId: string, data: any) {
  return await supabase
    .from("site_content")
    .upsert({
      site_id: siteId,
      data,
      updated_at: new Date().toISOString(),
    });
}
