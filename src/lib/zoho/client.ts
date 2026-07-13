import { createAdminClient } from '@/lib/supabase/admin';
import { getValidAccessToken, forceRefreshToken } from './tokenManager';
import { ZohoAPIError } from './types';
import type { ZohoTokenRow } from './types';
import { isTokenExpired } from './utils';

async function getZohoBaseUrl(): Promise<string> {
  if (process.env.ZOHO_API_BASE) return process.env.ZOHO_API_BASE;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('zoho_credentials')
    .select('zoho_org_id')
    .eq('id', 'singleton')
    .maybeSingle<Pick<ZohoTokenRow, 'zoho_org_id'>>();

  if (!data?.zoho_org_id) {
    throw new ZohoAPIError(0, 'Zoho API base URL not configured — connect via OAuth first');
  }
  return data.zoho_org_id;
}

export async function zohoFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = await getZohoBaseUrl();

  async function attempt(token: string): Promise<Response> {
    try {
      return await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      throw new ZohoAPIError(0, `Network error: ${err instanceof Error ? err.message : err}`);
    }
  }

  let token = await getValidAccessToken();
  let res = await attempt(token);

  // On token expiry, refresh once and retry transparently.
  if (!res.ok) {
    let body: unknown;
    try { body = await res.clone().json(); } catch { /* not JSON */ }
    if (isTokenExpired(res.status, body)) {
      token = await forceRefreshToken();
      res = await attempt(token);
    }
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch { /* not JSON */ }
    throw new ZohoAPIError(res.status, message);
  }

  return res;
}
