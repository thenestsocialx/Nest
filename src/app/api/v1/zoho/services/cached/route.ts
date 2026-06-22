// GET /api/v1/zoho/services/cached
// Returns active services from the zoho_services table. No Zoho API call.
// Used by Step 3 form to populate the service selector dropdown.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } },
      { status: 401 },
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('zoho_services')
    .select(
      'zoho_service_id, name, duration_mins, pre_buffer_mins, post_buffer_mins, ' +
      'effective_slot_mins, session_format, is_active, last_synced_at',
    )
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('[GET /api/v1/zoho/services/cached]', error);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ services: data ?? [] });
}
