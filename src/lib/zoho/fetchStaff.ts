// ══════════════════════════════════════════════════════════════
// Nest · Zoho Bookings — Fetch Staff
// Endpoint: GET {domain}/bookings/v1/json/staff?workspace_id={id}
// ══════════════════════════════════════════════════════════════

import { getValidAccessToken } from './tokenManager';
import { createAdminClient } from '@/lib/supabase/admin';
import { ZohoAPIError } from './types';
import type { ZohoTokenRow } from './types';

export interface ZohoStaffData {
  id: string;
  name: string;
  email: string;
  embed_url?: string;
  booking_url?: string;
  [key: string]: unknown;
}

async function getConfig(): Promise<{ baseUrl: string; workspaceId: string }> {
  if (process.env.ZOHO_API_BASE && process.env.ZOHO_WORKSPACE_ID) {
    return { baseUrl: process.env.ZOHO_API_BASE, workspaceId: process.env.ZOHO_WORKSPACE_ID };
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('zoho_credentials')
    .select('zoho_org_id, workspace_id')
    .eq('id', 'singleton')
    .maybeSingle<Pick<ZohoTokenRow, 'zoho_org_id' | 'workspace_id'>>();

  if (!data?.zoho_org_id || !data?.workspace_id) {
    throw new ZohoAPIError(0, 'Zoho not connected or workspace not configured');
  }
  return { baseUrl: data.zoho_org_id, workspaceId: data.workspace_id };
}

async function callStaffApi(
  extraParams: Record<string, string> = {},
): Promise<ZohoStaffData[]> {
  const [token, { baseUrl, workspaceId }] = await Promise.all([
    getValidAccessToken(),
    getConfig(),
  ]);

  const params = new URLSearchParams({ workspace_id: workspaceId, ...extraParams });
  const url = `${baseUrl}/bookings/v1/json/staffs?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
      cache: 'no-store',
    });
  } catch (err) {
    throw new ZohoAPIError(
      0,
      `Network error fetching Zoho staff: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!res.ok) {
    throw new ZohoAPIError(res.status, `Zoho staff list returned ${res.status}`);
  }

  const json = (await res.json()) as {
    response?: { returnvalue?: { data?: ZohoStaffData[] } };
  };

  return json?.response?.returnvalue?.data ?? [];
}

/**
 * Fetches a specific staff member from Zoho by ID and returns their embed_url.
 * Uses the staff_id filter so Zoho returns only that one record.
 */
export async function fetchZohoStaff(staffId: string): Promise<{ embed_url: string }> {
  const staffList = await callStaffApi({ staff_id: staffId });
  const staff = staffList.find(s => s.id === staffId) ?? staffList[0];

  if (!staff) {
    throw new ZohoAPIError(404, `Staff ID ${staffId} not found in Zoho workspace`);
  }

  const embedUrl = staff.embed_url ?? staff.booking_url;
  if (!embedUrl) {
    throw new ZohoAPIError(0, `Zoho staff ${staffId} returned no embed_url`);
  }

  return { embed_url: embedUrl };
}

/**
 * Finds an existing Zoho staff member by email.
 * Used as a fallback when addstaff reports the email is already registered.
 * Uses the staff_email filter so Zoho returns only matching records.
 */
export async function findZohoStaffByEmail(email: string): Promise<ZohoStaffData> {
  const staffList = await callStaffApi({ staff_email: email });
  const staff = staffList.find(
    s => typeof s.email === 'string' && s.email.toLowerCase() === email.toLowerCase(),
  ) ?? staffList[0];

  if (!staff) {
    throw new ZohoAPIError(
      404,
      `Staff with email "${email}" not found in Zoho workspace (already-exists fallback failed)`,
    );
  }

  return staff;
}
