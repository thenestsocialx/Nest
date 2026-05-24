// ══════════════════════════════════════════════════════════════
// Nest · Zoho Bookings — Create Service
// Endpoint: POST {domain}/bookings/v1/json/createservice
// Body:     multipart/form-data  key=serviceMap  value=JSON string
//
// Verified schema from https://www.zoho.com/bookings/help/api/v1/create-service.html
//   • data is an OBJECT (not an array)
//   • price field is "cost" (string)
//   • duration must be a string ("60", not 60)
//   • staff field is "assigned_staffs" (flat string array)
//   • workspace_id is REQUIRED inside the data object
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
  duration: number;   // minutes — sent as string to Zoho
  price: number;      // sent as string "cost" to Zoho
  description?: string;
  staffId?: string;   // assigned_staffs flat array
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
 * Zoho's createservice API requires multipart/form-data with a "serviceMap" key.
 * The serviceMap value is a JSON string with this exact shape (verified from docs):
 *
 *   {
 *     "data": {                        ← object, NOT array
 *       "name":            "string",
 *       "workspace_id":    "string",   ← required in body
 *       "duration":        "60",       ← string, not number
 *       "cost":            "799",      ← "cost" not "price", string not number
 *       "description":     "string",
 *       "assigned_staffs": ["id"]      ← flat array of strings
 *     }
 *   }
 */
export async function addZohoService(service: ZohoServiceInput): Promise<ZohoServiceResult> {
  const [token, { baseUrl, workspaceId }] = await Promise.all([
    getValidAccessToken(),
    getZohoConfig(),
  ]);

  // Build the serviceMap — all per verified Zoho Bookings API schema
  const serviceData: Record<string, unknown> = {
    name:         service.name,
    duration:     String(service.duration),   // must be string
    cost:         String(service.price),       // field is "cost", must be string
  };

  // workspace_id is required inside the data object
  if (workspaceId) serviceData.workspace_id = workspaceId;

  if (service.description)  serviceData.description     = service.description;
  if (service.staffId)      serviceData.assigned_staffs = [service.staffId];  // flat array

  const serviceMap = { data: serviceData };   // data is an OBJECT, not an array

  console.log('[addZohoService] sending serviceMap:', JSON.stringify(serviceMap));

  const formData = new FormData();
  formData.append('serviceMap', JSON.stringify(serviceMap));

  const orgParam = workspaceId ? `?orgId=${encodeURIComponent(workspaceId)}` : '';
  const url      = `${baseUrl}/bookings/v1/json/createservice${orgParam}`;

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

  const bodyStr = JSON.stringify(body);
  console.log('[addZohoService] response body:', bodyStr.slice(0, 800));

  if (!res.ok) {
    const msg =
      (body as { message?: string })?.message ??
      (body as { error?: string })?.error ??
      res.statusText;
    throw new ZohoAPIError(res.status, `Zoho createservice failed: ${msg}`);
  }

  // Zoho Bookings response shape (same nested structure as addstaff):
  //   { response: { returnvalue: { response: [{ id, name, status }] }, status: "success" } }
  const raw       = body as Record<string, unknown>;
  const outerResp = raw?.response         as Record<string, unknown> | null | undefined;
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
 * Creates one Zoho service per session duration an ally offers.
 * Returns { "60min": "zoho_service_id", "45min": "zoho_service_id" }
 * for storage in allies.zoho_service_ids.
 */
export async function createAllyServices(
  durations: string[],
  price: number,
  allyName: string,
  staffId: string,
): Promise<Record<string, string>> {
  const serviceIds: Record<string, string> = {};

  for (const dur of durations) {
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
