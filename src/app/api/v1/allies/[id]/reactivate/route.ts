// POST /api/v1/allies/[id]/reactivate
// Reactivates a paused ally: sets is_active=true and restores visibility flags.
// Requires admin. Ally must be in "active" onboarding_status with is_active=false.
import { NextRequest, NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { user, role: actorRole } = staff;

  const admin = createAdminClient();

  const { data: ally, error: fetchError } = await admin
    .from('allies')
    .select('id, full_name, onboarding_status, is_active')
    .eq('id', id)
    .single();

  if (fetchError || !ally) {
    return NextResponse.json({ error: 'Ally not found' }, { status: 404 });
  }

  if (ally.onboarding_status !== 'active') {
    return NextResponse.json(
      { error: `Cannot reactivate — ally onboarding status is "${ally.onboarding_status}". Only fully activated allies can be reactivated after a pause.` },
      { status: 409 },
    );
  }

  if (ally.is_active) {
    // Already active — idempotent
    return NextResponse.json({ ok: true, already_active: true });
  }

  const { data: updated, error: updateError } = await admin
    .from('allies')
    .update({
      is_active:            true,
      visibility_search:    true,
      visibility_bookings:  true,
      visibility_matching:  true,
    })
    .eq('id', id)
    .select('id, full_name, is_active, onboarding_status')
    .single();

  if (updateError) {
    console.error('[POST /reactivate]', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Fire-and-forget audit log
  logAuditEvent({
    actor_id:     user.id,
    actor_email:  user.email,
    actor_role:   actorRole,
    event_type:   'ally.reactivated',
    target_type:  'ally',
    target_id:    id,
    target_label: ally.full_name ?? undefined,
    action:       'reactivated',
    old_value:    { is_active: false },
    new_value:    { is_active: true },
  });

  return NextResponse.json({ ok: true, ally: updated });
}
