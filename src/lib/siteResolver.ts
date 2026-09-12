export interface SiteRow {
  id: string;
  subdomain: string;
  data?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export async function resolveSite(
  customerSubdomain: string,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<SiteRow | null> {
  let subdomain = (customerSubdomain || '').trim().toLowerCase();
  if (!subdomain) return null;

  subdomain = subdomain.replace(/\/+$/, '');

  const url = supabaseUrl.trim();
  const key = supabaseKey.trim();
  if (!url || !key) return null;

  const safe = subdomain.replace(/[^a-zA-Z0-9_-]/g, '');
  if (safe !== subdomain) {
    console.warn('[siteResolver] stripped invalid chars from subdomain:', subdomain, '→', safe);
    subdomain = safe;
  }
  if (!subdomain) return null;

  try {
    const res = await fetch(
      `${url}/rest/v1/sites?subdomain=eq.${encodeURIComponent(subdomain)}&select=*&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );

    if (!res.ok) {
      console.error('[siteResolver] HTTP', res.status, await res.text().catch(() => ''));
      return null;
    }

    const rows = (await res.json()) as SiteRow[];
    console.log('[siteResolver] rows returned:', rows.length, 'for', subdomain);
    return rows[0] ?? null;
  } catch (err) {
    console.error('[siteResolver] fetch failed:', err);
    return null;
  }
}
