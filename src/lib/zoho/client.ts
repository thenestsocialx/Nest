import { createAdminClient } from '@/lib/supabase/admin';
import { getValidAccessToken } from './tokenManager';
import { ZohoAPIError } from './types';
import type { ZohoTokenRow } from './types';

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
  const [token, baseUrl] = await Promise.all([getValidAccessToken(), getZohoBaseUrl()]);
  const url = `${baseUrl}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
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
