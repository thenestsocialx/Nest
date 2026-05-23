import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchWorkspaces } from '@/lib/zoho/fetchWorkspaces';
import { ZohoTokenError, ZohoAPIError } from '@/types/zoho';

/**
 * GET /api/v1/zoho/workspaces
 *
 * Returns the list of workspaces from the connected Zoho Bookings account.
 * Automatically refreshes the access token if it is near expiry.
 *
 * Admin-only. Requires the Zoho OAuth connection to be established first.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } },
      { status: 401 },
    );
  }

  try {
    const workspaces = await fetchWorkspaces();
    return NextResponse.json({ workspaces });
  } catch (err) {
    if (err instanceof ZohoTokenError) {
      const code = err.code === 'NOT_CONNECTED' ? 'NOT_CONNECTED' : 'REFRESH_FAILED';
      const message =
        code === 'NOT_CONNECTED'
          ? 'Zoho is not connected. Complete the OAuth flow first.'
          : 'Failed to refresh the Zoho access token. Re-connect Zoho from the Integrations page.';
      return NextResponse.json({ error: { code, message } }, { status: 400 });
    }

    if (err instanceof ZohoAPIError) {
      return NextResponse.json(
        { error: { code: 'ZOHO_API_ERROR', message: err.message } },
        { status: 502 },
      );
    }

    console.error('[zoho/workspaces] unexpected error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: 'An unexpected error occurred.' } },
      { status: 500 },
    );
  }
}
