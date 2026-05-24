// ══════════════════════════════════════════════════════════════
// Nest · Zoho Bookings — Add Service
// Endpoint: POST {domain}/bookings/v1/json/addservice
// Body:     multipart/form-data  key=serviceMap  value=JSON string
// ══════════════════════════════════════════════════════════════

import { createAdminClient } from '@/lib/supabase/admin';
import { getValidAccessToken } from './tokenManager';
import { ZohoAPIError } from './types';
import type { ZohoTokenRow } from './types';

interface ZohoConfig { baseUrl: string; workspaceId: string | null }

async function getZohoConfig(): Promise<ZohoConfig> {
  if (process.env.ZOHO_API_BASE) {
    return { baseUrl: process.env.ZOHO_API_BASE, workspaceId: process.env.ZOHO_WORKSPACE_ID ?? null };
  }
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('zoho_credentials')
    .select('zoho_org_id, workspace_id')
    .eq('id', 'singleton')
    .maybeSingle<Pick<ZohoTokenRow, 'zoho_org_id' | 'workspace_id'>>();

  if (!data?.zoho_org_id) {
    throw new ZohoAPIError(0, 'Zoho not connected — go to Admin › Integrations first');
  }
  return { baseUrl: data.zoho_org_id, workspaceId: data.workspace_id ?? null };
}

export interface ZohoServiceInput {
  name: string;
  duration: number;        // minutes
  price: number;
  description?: string;
  staffId?: string;        // assign to a specific staff member on creation
}

export interface ZohoServiceResult {
  id: string;
  name: string;
  status: 'success' | 'failure';
  message?: string;
}

/**
 * Creates a single service in Zoho Bookings.
 *
 * Uses FormData (not JSON) — same pattern as addZohoStaff — because Zoho's
 * Bookings API requires multipart/form-data with a "serviceMap" key.
 */
export async function addZohoService(service: ZohoServiceInput): Promise<ZohoServiceResult> {
  const [token, { baseUrl, workspaceId }] = await Promise.all([getValidAccessToken(), getZohoConfig()]);

  // Build the serviceMap payload
  const serviceEntry: Record<string, unknown> = {
    name:     service.name,
    duration: service.duration,
    price:    service.price,
    type:     '1',           // 1 = one-to-one (private) session
  };
  if (service.description) serviceEntry.description = service.description;
  // Zoho expects staff IDs as an array of single-element arrays: [["id1"], ["id2"]]
  if (service.staffId)     serviceEntry.staff_ids = [[service.staffId]];

  const serviceMap = { data: [serviceEntry] };

  const formData = new FormData();
  formData.append('serviceMap', JSON.stringify(serviceMap));

  const orgParam = workspaceId ? `?orgId=${encodeURIComponent(workspaceId)}` : '';
  const url      = `${baseUrl}/bookings/v1/json/addservice${orgParam}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body:    formData,
    });
  } catch (err) {
    throw new ZohoAPIError(
      0,
      `Network error reaching Zoho: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  let body: unknown;
  try { body = await res.json(); }
  catch { throw new ZohoAPIError(res.status, `Zoho returned non-JSON (${res.status})`); }

  if (!res.ok) {
    const msg =
      (body as { message?: string })?.message ??
      (body as { error?: string })?.error ??
      res.statusText;
    throw new ZohoAPIError(res.status, `Zoho addservice failed: ${msg}`);
  }

  // Same nested response shape as addstaff:
  //   { response: { returnvalue: { response: [{ id, name, status }] }, status } }
  const raw      = body as Record<string, unknown>;
  const bodyStr  = JSON.stringify(raw);
  console.log('[addZohoService] response:', bodyStr.slice(0, 600));

  const outerResp = raw?.response      as Record<string, unknown> | null | undefined;
  const returnVal = outerResp?.returnvalue as Record<string, unknown> | null | undefined;
  const innerArr  = returnVal?.response;

  let result: ZohoServiceResult | undefined;
  if (Array.isArray(innerArr)) {
    result = (innerArr as ZohoServiceResult[])[0];
  } else if (Array.isArray(outerResp)) {
    result = (outerResp as unknown as ZohoServiceResult[])[0];
  }

  if (!result) {
    throw new ZohoAPIError(0, `Zoho unexpected response. Body: ${bodyStr.slice(0, 400)}`);
  }
  if (!result.id && result.status !== 'success') {
    throw new ZohoAPIError(0, result.message ?? `Zoho service creation failed: ${result.status}`);
  }

  return result;
}

/**
 * Creates one Zoho service for every session duration an ally offers.
 * Returns a map of  { "60min": "zoho_service_id", "45min": "zoho_service_id" }
 * that can be stored in allies.zoho_service_ids.
 *
 * @param durations  e.g. ["60min", "45min"]  (from ally.session_durations)
 * @param price      session price in ₹
 * @param allyName   used in the service name so it's identifiable in Zoho
 * @param staffId    ally's zoho_staff_id — assigned to each service on creation
 */
export async function createAllyServices(
  durations: string[],
  price: number,
  allyName: string,
  staffId: string,
): Promise<Record<string, string>> {
  const serviceIds: Record<string, string> = {};

  for (const dur of durations) {
    // Parse "60min" → 60, "45min" → 45
    const minutes = parseInt(dur.replace(/[^0-9]/g, ''), 10);
    if (isNaN(minutes) || minutes <= 0) {
      console.warn(`[createAllyServices] skipping unrecognised duration: ${dur}`);
      continue;
    }

    const result = await addZohoService({
      name:        `${minutes}-min Session · ${allyName}`,
      duration:    minutes,
      price,
      description: `Private ${minutes}-minute session with ${allyName}`,
      staffId,
    });

    serviceIds[dur] = result.id;
    console.log(`[createAllyServices] created service for ${dur}: ${result.id}`);
  }

  return serviceIds;
}
