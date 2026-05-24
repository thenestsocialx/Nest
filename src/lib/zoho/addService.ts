// ══════════════════════════════════════════════════════════════
// Nest · Zoho Bookings — Create Service
// Endpoint: POST {domain}/bookings/v1/json/createservice
//
// Verified by live testing (2026-05-24):
//   • Content-Type must be application/json  ← NOT FormData like addstaff
//   • Body:  { "data": { name, duration, cost, workspace_id, ... } }
//   • duration and cost are strings ("60", "799")
//   • workspace_id is required inside the data object
//   • assigned_staffs is a flat string array (optional)
//   • Response: { response: { returnvalue: { status, message, data: { id } }, status } }
//     ↑ note: ID lives at .returnvalue.data.id — different from addstaff
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
  staffId?: string;   // goes into assigned_staffs flat array
}

export interface ZohoServiceResult {
  id: string;
  name?: string;
  status: 'success' | 'failure';
  message?: string;
}

/**
 * Creates a single service in Zoho Bookings.
 *
 * IMPORTANT: unlike addstaff (which uses multipart/form-data),
 * createservice requires Content-Type: application/json.
 * Verified live against the Zoho IN API on 2026-05-24.
 */
export async function addZohoService(service: ZohoServiceInput): Promise<ZohoServiceResult> {
  const [token, { baseUrl, workspaceId }] = await Promise.all([
    getValidAccessToken(),
    getZohoConfig(),
  ]);

  const serviceData: Record<string, unknown> = {
    name:         service.name,
    duration:     String(service.duration),  // must be string
    cost:         String(service.price),     // field is "cost", must be string
  };

  if (workspaceId)       serviceData.workspace_id    = workspaceId;
  if (service.description) serviceData.description   = service.description;
  if (service.staffId)   serviceData.assigned_staffs = [service.staffId];

  const bodyJson = JSON.stringify({ data: serviceData });
  console.log('[addZohoService] payload:', bodyJson);

  const orgParam = workspaceId ? `?orgId=${encodeURIComponent(workspaceId)}` : '';
  const url      = `${baseUrl}/bookings/v1/json/createservice${orgParam}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: bodyJson,
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
  console.log('[addZohoService] response:', bodyStr.slice(0, 600));

  if (!res.ok) {
    const msg =
      (body as { message?: string })?.message ??
      (body as { error?: string })?.error ??
      res.statusText;
    throw new ZohoAPIError(res.status, `Zoho createservice failed: ${msg}`);
  }

  // Response shape (verified live):
  //   { response: { returnvalue: { status: "success", message: "...", data: { id: "..." } }, status: "success" } }
  //   Note: ID is at .returnvalue.data.id — NOT .returnvalue.response[0].id like addstaff
  const raw       = body as Record<string, unknown>;
  const outerResp = raw?.response         as Record<string, unknown> | null | undefined;
  const returnVal = outerResp?.returnvalue as Record<string, unknown> | null | undefined;

  // Check for API-level errors even on HTTP 200
  if (outerResp?.status !== 'success' || returnVal?.status !== 'success') {
    const msg = (returnVal?.message as string) ?? (outerResp?.status as string) ?? 'unknown error';
    throw new ZohoAPIError(0, `Zoho createservice API error: ${msg}`);
  }

  const serviceId = (returnVal?.data as Record<string, unknown> | null | undefined)?.id as string | undefined;

  if (!serviceId) {
    throw new ZohoAPIError(0, `Zoho createservice succeeded but returned no ID. Body: ${bodyStr.slice(0, 400)}`);
  }

  return { id: serviceId, status: 'success', message: returnVal?.message as string | undefined };
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
