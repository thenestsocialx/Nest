import { getValidAccessToken, forceRefreshToken } from './tokenManager';
import { isTokenExpired } from './utils';
import { createAdminClient } from '@/lib/supabase/admin';

export interface ZohoServiceRaw {
  id: string;
  name: string;
  duration: string;
  buffertime: string;
  pre_buffer: number;
  post_buffer: number;
  price: string;
  currency: string;
  description: string;
  service_type: string;
  let_customer_select_staff: boolean;
  embed_url: string;
  assigned_workspace: string;
  assigned_staffs: string[];
}

export interface ZohoSyncResult {
  synced: number;
  deactivated: number;
}

/** Parse "30 mins", "1 hour", "1 hour 30 mins", "90 mins" → integer minutes */
export function parseDurationToMins(durStr: string): number {
  let mins = 0;
  const hourMatch = durStr.match(/(\d+)\s*hour/i);
  const minMatch  = durStr.match(/(\d+)\s*min/i);
  if (hourMatch) mins += parseInt(hourMatch[1], 10) * 60;
  if (minMatch)  mins += parseInt(minMatch[1], 10);
  return mins > 0 ? mins : 60;
}

/** Derive session_format from service name and description. Default: ['online']. */
function deriveSessionFormat(name: string, desc: string): string[] {
  const text = `${name} ${desc}`.toLowerCase();
  const hasInPerson = text.includes('in-person') || text.includes('inperson');
  const hasOnline   = text.includes('online');
  if (hasInPerson && hasOnline) return ['online', 'inperson'];
  if (hasInPerson) return ['inperson'];
  return ['online'];
}

async function fetchServicesPageRaw(
  token: string,
  workspaceId: string,
  page: number,
): Promise<Response> {
  const base = process.env.ZOHO_API_BASE ?? 'https://www.zohoapis.in';
  const url = `${base}/bookings/v1/json/services?workspace_id=${encodeURIComponent(workspaceId)}&page=${page}`;
  return fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
    cache: 'no-store',
  });
}

function parseServicesResponse(json: unknown): { data: ZohoServiceRaw[]; next_page_available: boolean } {
  const rv = (json as { response?: { returnvalue?: { data?: ZohoServiceRaw[]; next_page_available?: boolean } } })
    ?.response?.returnvalue;
  return { data: rv?.data ?? [], next_page_available: rv?.next_page_available ?? false };
}

/** Fetch all pages from Zoho until next_page_available is false. Cap at 20 pages. */
export async function fetchAllZohoServices(workspaceId: string): Promise<ZohoServiceRaw[]> {
  let token = await getValidAccessToken();
  const all: ZohoServiceRaw[] = [];
  const MAX_PAGES = 20;

  for (let page = 1; page <= MAX_PAGES; page++) {
    let res = await fetchServicesPageRaw(token, workspaceId, page);

    // On token expiry, refresh once and retry this page transparently.
    if (!res.ok) {
      let body: unknown;
      try { body = await res.clone().json(); } catch { /* not JSON */ }
      if (isTokenExpired(res.status, body)) {
        token = await forceRefreshToken();
        res = await fetchServicesPageRaw(token, workspaceId, page);
      }
    }

    if (!res.ok) throw new Error(`Zoho services API returned ${res.status}`);

    const { data, next_page_available } = parseServicesResponse(await res.json());
    all.push(...data);
    if (!next_page_available) break;
  }

  return all;
}

/**
 * Full sync: fetch all pages from Zoho, upsert APPOINTMENT services,
 * deactivate removed ones. Returns counts.
 */
export async function syncZohoServicesToDB(workspaceId: string): Promise<ZohoSyncResult> {
  const raw          = await fetchAllZohoServices(workspaceId);
  const appointments = raw.filter(s => s.service_type === 'APPOINTMENT');
  const admin        = createAdminClient();
  const activeIds    = appointments.map(s => s.id);

  for (const s of appointments) {
    const durationMins     = parseDurationToMins(s.duration);
    const preBuf           = s.pre_buffer  ?? 0;
    const postBuf          = s.post_buffer ?? 0;
    const effectiveSlotMins = durationMins + preBuf + postBuf;
    const priceZoho        = parseFloat(s.price);

    await admin.from('zoho_services').upsert(
      {
        zoho_service_id:           s.id,
        zoho_workspace_id:         s.assigned_workspace ?? workspaceId,
        name:                      s.name,
        duration_mins:             durationMins,
        pre_buffer_mins:           preBuf,
        post_buffer_mins:          postBuf,
        effective_slot_mins:       effectiveSlotMins,
        price_zoho:                isNaN(priceZoho) ? null : priceZoho,
        currency:                  s.currency   ?? 'INR',
        description:               s.description ?? '',
        service_type:              s.service_type,
        session_format:            deriveSessionFormat(s.name, s.description ?? ''),
        let_customer_select_staff: s.let_customer_select_staff ?? true,
        embed_url:                 s.embed_url ?? null,
        assigned_staffs:           s.assigned_staffs ?? [],
        is_active:                 true,
        last_synced_at:            new Date().toISOString(),
      },
      { onConflict: 'zoho_service_id' },
    );
  }

  // Deactivate services that were previously synced but are no longer returned by Zoho
  let deactivated = 0;
  if (activeIds.length > 0) {
    const res = await admin
      .from('zoho_services')
      .update({ is_active: false }, { count: 'exact' })
      .eq('zoho_workspace_id', workspaceId)
      .eq('is_active', true)
      .not('zoho_service_id', 'in', `(${activeIds.join(',')})`);
    deactivated = res.count ?? 0;
  } else {
    // Zoho returned no services — deactivate everything in this workspace
    const res = await admin
      .from('zoho_services')
      .update({ is_active: false }, { count: 'exact' })
      .eq('zoho_workspace_id', workspaceId)
      .eq('is_active', true);
    deactivated = res.count ?? 0;
  }

  return { synced: appointments.length, deactivated };
}
