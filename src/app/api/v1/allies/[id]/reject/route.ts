// POST /api/v1/allies/[id]/reject
// Moves an ally to "rejected" from any non-active state.
// Requires admin. Optional body: { reason: string }
import { NextRequest, NextResponse } from 'next/server';
import { getStaffUser } from '@/lib/auth-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const staff = await getStaffUser();
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { user, role: actorRole } = staff;

  // Optional reason in request body
  let reason: string | null = null;
  try {
    const body = await req.json() as { reason?: string };
    reason = body.reason?.trim() || null;
  } catch { /* body is optional */ }

  const admin = createAdminClient();

  const { data: ally, error: fetchError } = await admin
    .from('allies')
    .select('id, onboarding_status, full_name')
    .eq('id', id)
    .single();

  if (fetchError || !ally) {
    return NextResponse.json({ error: 'Ally not found' }, { status: 404 });
  }

  if (ally.onboarding_status === 'active') {
    return NextResponse.json(
      { error: 'Cannot reject an already-active ally. Pause or deactivate them instead.' },
      { status: 409 },
    );
  }

  const updatePayload: Record<string, unknown> = { onboarding_status: 'rejected' };
  if (reason) updatePayload.admin_notes = reason;

  const { data: updated, error: updateError } = await admin
    .from('allies')
    .update(updatePayload)
    .eq('id', id)
    .select('id, onboarding_status, full_name, admin_notes')
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Fire-and-forget audit log
  logAuditEvent({
    actor_id:     user.id,
    actor_email:  user.email,
    event_type:   'ally.rejected',
    target_type:  'ally',
    target_id:    id,
    target_label: ally.full_name ?? undefined,
    action:       'rejected',
    old_value:    { onboarding_status: ally.onboarding_status },
    new_value:    { onboarding_status: 'rejected' },
    metadata:     reason ? { reason } : undefined,
  });

  return NextResponse.json({ ok: true, ally: updated });
}
