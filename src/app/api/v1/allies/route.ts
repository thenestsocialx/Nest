// GET  /api/v1/allies          — List allies (admin-only). Query: ?status=submitted,approved
// POST /api/v1/allies          — Create a blank draft ally record
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status'); // e.g. "submitted,approved"

  const admin = createAdminClient();
  let query = admin
    .from('allies')
    .select(
      'id, full_name, display_name, email, photo_url, primary_role, specialties, ' +
      'onboarding_status, onboarding_step, is_active, zoho_staff_id, zoho_service_ids, ' +
      'session_durations, session_price, created_at, updated_at, admin_notes',
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (statusParam) {
    const statuses = statusParam.split(',').map(s => s.trim()).filter(Boolean);
    if (statuses.length === 1) {
      query = query.eq('onboarding_status', statuses[0]) as typeof query;
    } else if (statuses.length > 1) {
      query = query.in('onboarding_status', statuses) as typeof query;
    }
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ allies: data ?? [] });
}

export async function POST(_req: NextRequest) {
  // Admin-only
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from('allies')
    .insert({
      display_name:      '',
      onboarding_status: 'draft',
      onboarding_step:   1,
      is_active:         false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[POST /api/v1/allies]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
