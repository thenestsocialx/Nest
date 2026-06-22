// POST /api/v1/zoho/sync-services
// Full sync: fetch all Zoho services, upsert APPOINTMENTs, deactivate removed ones.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncZohoServicesToDB } from '@/lib/zoho/fetchServices';
import { ZohoTokenError } from '@/types/zoho';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') return null;
  return user;
}

export async function POST() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } },
      { status: 401 },
    );
  }

  const admin = createAdminClient();
  const { data: creds } = await admin
    .from('zoho_credentials')
    .select('workspace_id')
    .eq('id', 'singleton')
    .maybeSingle<{ workspace_id: string | null }>();

  if (!creds?.workspace_id) {
    return NextResponse.json(
      { error: { code: 'NO_WORKSPACE', message: 'No Zoho workspace selected. Configure it in Integrations first.' } },
      { status: 422 },
    );
  }

  try {
    const result = await syncZohoServicesToDB(creds.workspace_id);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ZohoTokenError) {
      return NextResponse.json(
        { error: { code: err.code, message: 'Zoho token error. Reconnect Zoho in Integrations.' } },
        { status: 502 },
      );
    }
    console.error('[POST /api/v1/zoho/sync-services]', err);
    return NextResponse.json(
      { error: { code: 'SYNC_FAILED', message: err instanceof Error ? err.message : 'Sync failed' } },
      { status: 500 },
    );
  }
}
