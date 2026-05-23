import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ZohoStatusResponse } from '@/types/zoho';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from('zoho_credentials')
    .select('expires_at, updated_at, zoho_org_id')
    .eq('id', 'singleton')
    .maybeSingle();

  const response: ZohoStatusResponse = {
    connected: !!data,
    expires_at: data?.expires_at ?? null,
    last_updated: data?.updated_at ?? null,
    org_id: data?.zoho_org_id ?? null,
  };

  return NextResponse.json(response);
}
