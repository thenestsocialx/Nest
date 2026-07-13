/**
 * Returns true if a Zoho API response indicates the access token is expired or invalid.
 * Zoho signals this with HTTP 401, or a 200 response containing a known token error code.
 */
export function isTokenExpired(status: number, body: unknown): boolean {
  if (status === 401) return true;
  const code = (body as { response?: { errorCode?: string } })?.response?.errorCode;
  return (
    code === 'INVALID_OAUTHTOKEN' ||
    code === 'INVALID_TOKEN' ||
    code === 'AUTHENTICATION_FAILURE'
  );
}
