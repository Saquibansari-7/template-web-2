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
    console.warn('[siteResolver] invalid subdomain format:', subdomain);
    return null;
  }

  try {
    const res = await fetch(
      `${MAIN_APP_URL}/api/site/lookup?customer=${encodeURIComponent(subdomain)}`,
    );

    if (!res.ok) {
      console.warn('[siteResolver] API returned non-200 for', subdomain, 'status:', res.status);
      return null;
    }

    const site = (await res.json()) as SiteRow & { template_id?: string; status?: string };
    console.log('[siteResolver] API response for', subdomain, ':', {
      id: site.id,
      subdomain: site.subdomain,
      template_id: site.template_id,
      status: site.status,
      hasData: !!site.data,
    });

    if (site.template_id !== EXPECTED_TEMPLATE_ID) {
      console.warn('[siteResolver] template_id mismatch for', subdomain, ':', site.template_id, '!==', EXPECTED_TEMPLATE_ID);
      return null;
    }

    if (site.status !== 'active') {
      console.warn('[siteResolver] status not active for', subdomain, ':', site.status);
      return null;
    }

    return site;
  } catch (err) {
    console.warn('[siteResolver] fetch failed for', subdomain, err);
    return null;
  }
}
