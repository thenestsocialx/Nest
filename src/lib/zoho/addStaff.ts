// ══════════════════════════════════════════════════════════════
// Nest · Zoho Bookings — Add Staff
// Endpoint: POST {domain}/bookings/v1/json/addstaff
// Body:     multipart/form-data  key=staffMap  value=JSON string
// ══════════════════════════════════════════════════════════════

import { createAdminClient } from '@/lib/supabase/admin';
import { getValidAccessToken } from './tokenManager';
import { ZohoAPIError } from './types';
import { findZohoStaffByEmail } from './fetchStaff';
import type { ZohoTokenRow } from './types';
import type { ZohoStaffInput, ZohoStaffResult } from '@/types/ally';

// ── Get base URL + workspace ID (duplicated from client.ts to avoid Content-Type conflict) ──
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
    throw new ZohoAPIError(
      0,
      'Zoho not connected — go to Admin › Integrations and connect Zoho Bookings first',
    );
  }
  return { baseUrl: data.zoho_org_id, workspaceId: data.workspace_id ?? null };
}

/** Derive Zoho gender from pronouns string */
export function genderFromPronouns(pronouns: string | null): 'Male' | 'Female' | 'Other' {
  if (!pronouns) return 'Other';
  const p = pronouns.toLowerCase();
  if (p.includes('she') && !p.includes('they')) return 'Female';
  if (p.includes('he') && !p.includes('they')) return 'Male';
  return 'Other';
}

/**
 * Creates a staff member in Zoho Bookings.
 *
 * IMPORTANT: This function intentionally does NOT use `zohoFetch()` because
 * that helper forces Content-Type: application/json, which breaks multipart/form-data.
 * We call getValidAccessToken() + getZohoBaseUrl() directly and let the runtime
 * set the multipart boundary automatically by not specifying Content-Type.
 */
export async function addZohoStaff(staff: ZohoStaffInput): Promise<ZohoStaffResult> {
  const [token, { baseUrl, workspaceId }] = await Promise.all([getValidAccessToken(), getZohoConfig()]);

  // Build staffMap payload (Zoho's required structure)
  const staffEntry: Record<string, unknown> = {
    name:  staff.name,
    email: staff.email,
    role:  staff.role ?? 'Staff',
  };
  if (staff.gender)            staffEntry.gender           = staff.gender;
  if (staff.dob)               staffEntry.dob              = staff.dob;
  if (staff.phone)             staffEntry.phone            = staff.phone;
  if (staff.designation)       staffEntry.designation      = staff.designation;
  if (staff.additional_info)   staffEntry.additional_info  = staff.additional_info;
  if (staff.assigned_services?.length) {
    staffEntry.assigned_services = staff.assigned_services;
  }

  const staffMap = { data: [staffEntry] };

  // Use FormData — do NOT set Content-Type, let fetch set it with boundary
  const formData = new FormData();
  formData.append('staffMap', JSON.stringify(staffMap));

  // Zoho Bookings requires orgId (workspace_id) as a query parameter to identify the organisation
  const orgParam = workspaceId ? `?orgId=${encodeURIComponent(workspaceId)}` : '';
  const url = `${baseUrl}/bookings/v1/json/addstaff${orgParam}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // No Content-Type — FormData sets it with boundary automatically
      },
      body: formData,
    });
  } catch (err) {
    throw new ZohoAPIError(
      0,
      `Network error reaching Zoho: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // Parse response body for errors even on non-200
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ZohoAPIError(res.status, `Zoho returned non-JSON response (${res.status})`);
  }

  if (!res.ok) {
    const msg =
      (body as { message?: string })?.message ??
      (body as { error?: string })?.error ??
      res.statusText;
    throw new ZohoAPIError(res.status, `Zoho addstaff failed: ${msg}`);
  }

  // Actual Zoho Bookings addstaff response shape (verified 2026-05-24):
  //   {
  //     "response": {
  //       "returnvalue": {
  //         "response": [{ "id": "...", "name": "...", "email": "...", "status": "success" }]
  //       },
  //       "status": "success"
  //     }
  //   }
  const raw        = body as Record<string, unknown>;
  const bodyStr    = JSON.stringify(raw);
  console.log('[addZohoStaff] response body:', bodyStr.slice(0, 600));

  // Navigate the nested path: response → returnvalue → response[0]
  const outerResp = raw?.response as Record<string, unknown> | null | undefined;
  const returnVal = outerResp?.returnvalue as Record<string, unknown> | null | undefined;
  const innerArr  = returnVal?.response;

  let result: ZohoStaffResult | undefined;
  if (Array.isArray(innerArr)) {
    // Standard nested path
    result = (innerArr as ZohoStaffResult[])[0];
  } else if (Array.isArray(outerResp)) {
    // Flat-array fallback (older API versions)
    result = (outerResp as unknown as ZohoStaffResult[])[0];
  }

  if (!result) {
    throw new ZohoAPIError(
      0,
      `Zoho returned an unexpected response structure. Body: ${bodyStr.slice(0, 400)}`,
    );
  }

  if (!result.id && result.status !== 'success') {
    const message = result.message ?? `Zoho staff creation failed with status: ${result.status}`;

    // Staff already exists in Zoho — fetch them by email and reuse their ID
    if (/already exist|duplicate|already registered/i.test(message)) {
      console.log('[addZohoStaff] staff already exists, fetching by email:', staff.email);
      const existing = await findZohoStaffByEmail(staff.email);
      return {
        id:     existing.id,
        name:   existing.name  ?? staff.name,
        email:  existing.email ?? staff.email,
        status: 'success',
      };
    }

    throw new ZohoAPIError(0, message);
  }

  return result;
}
