import { zohoFetch } from './client';
import { ZohoAPIError } from './types';

export interface ZohoWorkspace {
  id: string;
  name: string;
}

interface WorkspacesApiResponse {
  response: {
    returnvalue: {
      data: ZohoWorkspace[];
    };
    status: string;
  };
}

/**
 * Fetch the list of Zoho Bookings workspaces for the connected account.
 *
 * Uses zohoFetch() which automatically:
 *   - Refreshes the access token if it is within the 5-minute expiry buffer
 *   - Injects the Authorization header
 *   - Uses the stored zoho_org_id (api_domain) as the base URL
 *
 * @returns Array of { id, name } workspace objects
 * @throws ZohoTokenError  – if no credentials exist or refresh fails
 * @throws ZohoAPIError    – if the Zoho API returns a non-success response
 */
export async function fetchWorkspaces(): Promise<ZohoWorkspace[]> {
  const res = await zohoFetch('/bookings/v1/json/workspaces');

  let body: WorkspacesApiResponse;
  try {
    body = (await res.json()) as WorkspacesApiResponse;
  } catch {
    throw new ZohoAPIError(200, 'Zoho workspaces response was not valid JSON');
  }

  if (body?.response?.status !== 'success') {
    throw new ZohoAPIError(200, `Zoho workspaces API returned status: ${body?.response?.status ?? 'unknown'}`);
  }

  const data = body?.response?.returnvalue?.data;
  if (!Array.isArray(data)) {
    throw new ZohoAPIError(200, 'Zoho workspaces response contained no data array');
  }

  return data.map((w) => ({ id: String(w.id), name: String(w.name) }));
}
