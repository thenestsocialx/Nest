export interface ZohoTokenRow {
  id: 'singleton';
  access_token: string;
  refresh_token: string;
  expires_at: string;
  zoho_org_id: string | null;
  workspace_id: string | null;
  workspace_name: string | null;
  updated_at: string;
}

/** A single Zoho Bookings workspace returned by /bookings/v1/json/workspaces */
export interface ZohoWorkspace {
  id: string;
  name: string;
}

export interface ZohoStatusResponse {
  connected: boolean;
  expires_at: string | null;
  last_updated: string | null;
  org_id: string | null;
}

export interface ZohoTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  api_domain: string;
  token_type: string;
}

export class ZohoTokenError extends Error {
  constructor(public readonly code: 'NOT_CONNECTED' | 'REFRESH_FAILED') {
    super(`Zoho token error: ${code}`);
    this.name = 'ZohoTokenError';
  }
}

export class ZohoAPIError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ZohoAPIError';
  }
}

/** A synced Zoho service row from public.zoho_services */
export interface ZohoServiceRow {
  zoho_service_id:       string;
  name:                  string;
  duration_mins:         number;
  pre_buffer_mins:       number;
  post_buffer_mins:      number;
  effective_slot_mins:   number;
  session_format:        string[];
  is_active:             boolean;
  last_synced_at?:       string;
}
