export interface SiteRow {
  id: string;
  subdomain: string;
  data?: Record<string, unknown> | null;
  [key: string]: unknown;
}

const MAIN_APP_URL = 'https://weddappvows.vercel.app';
const EXPECTED_TEMPLATE_ID = 'editorial';
const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/;

export async function resolveSite(
  customerSubdomain: string,
): Promise<SiteRow | null> {
  const subdomain = (customerSubdomain || '').trim().toLowerCase();
  if (!subdomain || !SUBDOMAIN_REGEX.test(subdomain)) {
    return null;
  }

  try {
    const res = await fetch(
      `${MAIN_APP_URL}/api/site/lookup?customer=${encodeURIComponent(subdomain)}`,
    );

    if (!res.ok) {
      return null;
    }

    const site = (await res.json()) as SiteRow & { template_id?: string; status?: string };

    if (site.template_id !== EXPECTED_TEMPLATE_ID) {
      return null;
    }

    if (site.status !== 'active') {
      return null;
    }

    return site;
  } catch (err) {
    console.warn('[siteResolver] fetch failed for', subdomain, err);
    return null;
  }
}
