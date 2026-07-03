// GET  /api/v1/allies/:id/session-config  — Load Step 3 saved state
// PUT  /api/v1/allies/:id/session-config  — Save / update Step 3
import { NextRequest, NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('ally_session_config')
    .select('*, zoho_services(zoho_service_id, name, duration_mins, pre_buffer_mins, post_buffer_mins, effective_slot_mins, session_format)')
    .eq('ally_id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data ?? null });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const zohoServiceId      = body.zoho_service_id   as string | null | undefined;
  const priceInr           = body.price_inr         as number | null | undefined;
  const sessionFormat      = body.session_format    as string[] | null | undefined;
  const bufferMins         = body.buffer_mins       as number | null | undefined;
  const maxSessionsWeek    = body.max_sessions_week as number | null | undefined;
  const visibilitySearch   = body.visibility_search   as boolean | null | undefined;
  const visibilityBookings = body.visibility_bookings as boolean | null | undefined;
  const visibilityMatching = body.visibility_matching as boolean | null | undefined;
  const visibilityFeatured = body.visibility_featured as boolean | null | undefined;

  const admin = createAdminClient();

  // Validate zoho_service_id exists if provided
  if (zohoServiceId) {
    const { data: svc } = await admin
      .from('zoho_services')
      .select('zoho_service_id')
      .eq('zoho_service_id', zohoServiceId)
      .eq('is_active', true)
      .maybeSingle();

    if (!svc) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_FOUND', message: 'zoho_service_id not found in synced services.' } },
        { status: 422 },
      );
    }
  }

  const upsertPayload = {
    ally_id:             id,
    zoho_service_id:     zohoServiceId      ?? null,
    pricing_tier:        null,
    price_inr:           priceInr           ?? null,
    session_format:      sessionFormat      ?? ['online'],
    buffer_mins:         bufferMins         ?? 15,
    max_sessions_week:   maxSessionsWeek    ?? 10,
    visibility_search:   visibilitySearch   ?? false,
    visibility_bookings: visibilityBookings ?? false,
    visibility_matching: visibilityMatching ?? true,
    visibility_featured: visibilityFeatured ?? false,
  };

  const { data, error } = await admin
    .from('ally_session_config')
    .upsert(upsertPayload, { onConflict: 'ally_id' })
    .select('id, ally_id, pricing_tier, price_inr, updated_at')
    .single();

  if (error) {
    console.error('[PUT /api/v1/allies/:id/session-config]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mirror zoho_service_id on the allies row for quick joins
  await admin
    .from('allies')
    .update({ zoho_service_id: zohoServiceId ?? null, pricing_tier: null })
    .eq('id', id);

  return NextResponse.json({ ok: true, ...data });
}
