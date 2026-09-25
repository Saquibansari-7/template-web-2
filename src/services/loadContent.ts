import { supabase } from "../lib/supabase";

export async function loadContent(siteId: string) {
  if (!supabase || typeof supabase.from !== "function") {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("data")
      .eq("site_id", siteId)
      .single();

    if (error) {
      console.warn('[loadContent] supabase error for', siteId, error.message);
      return null;
    }
    return data?.data;
  } catch (err) {
    console.warn('[loadContent] fetch failed for', siteId, err);
    return null;
  }
}

export function mergeDeep(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];

    if (
      sourceVal &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal)
    ) {
      result[key] = mergeDeep(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      );
    } else if (Array.isArray(sourceVal) && Array.isArray(targetVal)) {
      result[key] = sourceVal;
    } else {
      result[key] = sourceVal;
    }
  }
  return result;
}

export async function loadContentByCustomer(
  customer: string,
  defaultContent: Record<string, unknown>,
) {
  const { resolveSite } = await import("../lib/siteResolver");
  const site = await resolveSite(customer);
  if (!site || !site.data) return null;

  const merged = mergeDeep(defaultContent, site.data as Record<string, unknown>);
  return { site, content: merged };
}
