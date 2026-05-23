import { createAdminClient } from '@/lib/supabase/admin';
import type { ZohoTokenRow } from './types';
import { ZohoTokenError } from './types';

async function refreshAccessToken(
  row: Pick<ZohoTokenRow, 'refresh_token'>,
): Promise<string> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: row.refresh_token,
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
  });

  let res: Response;
  try {
    res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
  } catch {
    throw new ZohoTokenError('REFRESH_FAILED');
  }

  if (!res.ok) throw new ZohoTokenError('REFRESH_FAILED');

  const data = (await res.json()) as { access_token?: string; expires_in?: number; refresh_token?: string };
  if (!data.access_token || data.expires_in == null) throw new ZohoTokenError('REFRESH_FAILED');

  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  const supabase = createAdminClient();

  // Zoho can rotate the refresh_token on each refresh call (depends on account config).
  // Include it in the update payload if the response provides a new one.
  const updatePayload: Record<string, string> = {
    access_token: data.access_token,
    expires_at: newExpiresAt,
    updated_at: new Date().toISOString(),
  };
  if (data.refresh_token) updatePayload.refresh_token = data.refresh_token;

  const { error } = await supabase
    .from('zoho_credentials')
    .update(updatePayload)
    .eq('id', 'singleton');

  if (error) throw new ZohoTokenError('REFRESH_FAILED');
  return data.access_token;
}

export async function getValidAccessToken(): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('zoho_credentials')
    .select('access_token, refresh_token, expires_at')
    .eq('id', 'singleton')
    .maybeSingle<Pick<ZohoTokenRow, 'access_token' | 'refresh_token' | 'expires_at'>>();

  if (error || !data) throw new ZohoTokenError('NOT_CONNECTED');

  const expiresAt = new Date(data.expires_at).getTime();
  const bufferMs = 5 * 60 * 1000; // 5-minute buffer

  if (expiresAt > Date.now() + bufferMs) return data.access_token;
  return refreshAccessToken(data);
}

export function scheduleTokenRefresh(): ReturnType<typeof setInterval> {
  const INTERVAL_MS = 45 * 60 * 1000; // 45 minutes

  const tick = async () => {
    try {
      await getValidAccessToken();
      console.log(`[zoho] token warm at ${new Date().toISOString()}`);
    } catch (err) {
      console.error(`[zoho] proactive refresh failed:`, err instanceof Error ? err.message : err);
    }
  };

  void tick();
  return setInterval(tick, INTERVAL_MS);
}
