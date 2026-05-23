export interface ZohoTokenRow {
  id: 'singleton';
  access_token: string;
  refresh_token: string;
  expires_at: string;
  zoho_org_id: string | null;
  updated_at: string;
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
