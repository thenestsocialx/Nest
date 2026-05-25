// POST /api/v1/allies/[id]/activate
// Final activation step: creates Zoho services, sets is_active=true, status="active".
// Requires admin. Ally must be "approved" with a valid zoho_staff_id.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAllyServices } from '@/lib/zoho/addService';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Admin-only
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch ally
  const { data: ally, error: fetchError } = await admin
    .from('allies')
    .select('id, onboarding_status, is_active, zoho_staff_id, zoho_service_ids, full_name, session_durations, session_price')
    .eq('id', id)
    .single();

  if (fetchError || !ally) {
    return NextResponse.json({ error: 'Ally not found' }, { status: 404 });
  }

  // Must be approved first
  if (ally.onboarding_status !== 'approved') {
    return NextResponse.json(
      { error: `Cannot activate — current status is "${ally.onboarding_status}". Ally must be in "approved" state first.` },
      { status: 409 },
    );
  }

  // Must have a Zoho staff ID
  if (!ally.zoho_staff_id) {
    return NextResponse.json(
      { error: 'Cannot activate — Zoho staff ID is missing. Please complete onboarding (Steps 1–5) first.' },
      { status: 409 },
    );
  }

  // Already active — idempotent
  if (ally.is_active && ally.onboarding_status === 'active') {
    return NextResponse.json({ ok: true, already_active: true, ally });
  }

  // ── Create Zoho services ─────────────────────────────────────────────────
  // Use existing service IDs if already created (re-activation safety)
  let zohoServiceIds: Record<string, string> =
    (ally.zoho_service_ids as Record<string, string> | null) ?? {};

  const durations     = (ally.session_durations as string[] | null) ?? [];
  const price         = (ally.session_price as number | null) ?? 0;
  const allyName      = (ally.full_name as string | null) ?? 'Ally';
  const staffId       = ally.zoho_staff_id as string;

  // Only create services for durations that don't already have an ID
  const missedDurations = durations.filter(d => !zohoServiceIds[d]);

  if (missedDurations.length > 0) {
    try {
      const newServiceIds = await createAllyServices(
        missedDurations,
        price,
        allyName,
        staffId,
      );
      zohoServiceIds = { ...zohoServiceIds, ...newServiceIds };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Zoho service creation failed';
      console.error('[POST /activate] Zoho error:', message);
      return NextResponse.json(
        { error: message, zoho_error: true },
        { status: 502 },
      );
    }
  }

  // ── Update ally: is_active, status, service IDs ──────────────────────────
  const { data: updated, error: updateError } = await admin
    .from('allies')
    .update({
      is_active:          true,
      onboarding_status:  'active',
      zoho_service_ids:   zohoServiceIds,
    })
    .eq('id', id)
    .select('id, full_name, is_active, onboarding_status, zoho_staff_id, zoho_service_ids')
    .single();

  if (updateError) {
    console.error('[POST /activate] DB error:', updateError);
    // Services were created in Zoho — return partial success so caller knows
    return NextResponse.json(
      {
        ok:                false,
        warning:           `DB update failed: ${updateError.message}`,
        zoho_service_ids:  zohoServiceIds,
      },
      { status: 207 },
    );
  }

  // Fire-and-forget audit log
  logAuditEvent({
    actor_id:     user.id,
    actor_email:  user.email,
    event_type:   'ally.activated',
    target_type:  'ally',
    target_id:    id,
    target_label: allyName,
    action:       'activated',
    old_value:    { onboarding_status: 'approved', is_active: false },
    new_value:    { onboarding_status: 'active', is_active: true },
  });

  return NextResponse.json({ ok: true, ally: updated });
}
