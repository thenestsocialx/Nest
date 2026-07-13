import { createAdminClient } from '@/lib/supabase/admin';
import type { ZohoTokenRow } from './types';
import { ZohoTokenError } from './types';

async function refreshAccessToken(
  row: Pick<ZohoTokenRow, 'refresh_token'>,
): Promise<string> {
  if (!process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_CLIENT_SECRET) {
    console.error('[zoho] REFRESH_FAILED: ZOHO_CLIENT_ID or ZOHO_CLIENT_SECRET env var is missing');
    throw new ZohoTokenError('REFRESH_FAILED');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: row.refresh_token,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
  });

  let res: Response;
  try {
    res = await fetch('https://accounts.zoho.in/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
  } catch (err) {
    console.error('[zoho] REFRESH_FAILED: network error reaching Zoho OAuth endpoint:', err instanceof Error ? err.message : err);
    throw new ZohoTokenError('REFRESH_FAILED');
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '(unreadable)');
    console.error(`[zoho] REFRESH_FAILED: Zoho OAuth returned ${res.status}:`, body);
    throw new ZohoTokenError('REFRESH_FAILED');
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number; refresh_token?: string; error?: string };
  if (!data.access_token || data.expires_in == null) {
    console.error('[zoho] REFRESH_FAILED: unexpected OAuth response (missing access_token or expires_in):', JSON.stringify(data));
    throw new ZohoTokenError('REFRESH_FAILED');
  }

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

  if (error) {
    console.error('[zoho] REFRESH_FAILED: could not save new token to DB:', error.message);
    throw new ZohoTokenError('REFRESH_FAILED');
  }
  return data.access_token;
}

/**
 * Forces a token refresh regardless of the stored expires_at.
 * Use when a Zoho API call returns a token-expiry error to recover without
 * surfacing the error to the user.
 */
export async function forceRefreshToken(): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('zoho_credentials')
    .select('refresh_token')
    .eq('id', 'singleton')
    .maybeSingle<Pick<ZohoTokenRow, 'refresh_token'>>();
  if (error || !data) throw new ZohoTokenError('NOT_CONNECTED');
  return refreshAccessToken(data);
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

  // Token appears expired per our records. Attempt a proactive refresh.
  // If the refresh fails (e.g. invalid_code from Zoho), fall back to the
  // existing token — it may still be accepted by Zoho if their server-side
  // expiry is later than our stored expires_at. The caller's retry logic
  // (isTokenExpired + forceRefreshToken) will surface the error if the token
  // truly no longer works.
  try {
    return await refreshAccessToken(data);
  } catch {
    console.warn('[zoho] proactive refresh failed; falling back to existing token');
    return data.access_token;
  }
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
