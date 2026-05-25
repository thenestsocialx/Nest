// POST /api/v1/allies/[id]/approve
// Moves an ally from "submitted" → "approved".
// THIS is where the Zoho staff record is created — only approved allies reach Zoho.
// Requires admin.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { addZohoStaff, genderFromPronouns } from '@/lib/zoho/addStaff';
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

  // Fetch full ally record (need profile fields for Zoho)
  const { data: ally, error: fetchError } = await admin
    .from('allies')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !ally) {
    return NextResponse.json({ error: 'Ally not found' }, { status: 404 });
  }

  // Must be in "submitted" state
  if (ally.onboarding_status !== 'submitted') {
    return NextResponse.json(
      { error: `Cannot approve — current status is "${ally.onboarding_status}". Ally must be in "submitted" state.` },
      { status: 409 },
    );
  }

  // ── Create Zoho staff ────────────────────────────────────────────────────────
  // Re-use existing staff ID if a previous approve attempt already created it
  let zohoStaffId: string;

  if (ally.zoho_staff_id) {
    // Already created (e.g. re-approve after a DB failure) — skip the API call
    zohoStaffId = ally.zoho_staff_id;
    console.log('[POST /approve] reusing existing zoho_staff_id:', zohoStaffId);
  } else {
    try {
      const result = await addZohoStaff({
        name:            ally.full_name,
        email:           ally.email,
        gender:          genderFromPronouns(ally.pronouns),
        role:            'Staff',
        phone:           ally.phone        ?? undefined,
        designation:     ally.primary_role ?? undefined,
        additional_info: ally.bio          ?? undefined,
      });
      zohoStaffId = result.id;
      console.log('[POST /approve] Zoho staff created:', zohoStaffId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Zoho staff creation failed';
      console.error('[POST /approve] Zoho error:', message);
      return NextResponse.json(
        { error: message, zoho_error: true },
        { status: 502 },
      );
    }
  }

  // ── Save approval + zoho_staff_id ────────────────────────────────────────────
  const { data: updated, error: updateError } = await admin
    .from('allies')
    .update({
      zoho_staff_id:     zohoStaffId,
      onboarding_status: 'approved',
    })
    .eq('id', id)
    .select('id, full_name, onboarding_status, zoho_staff_id')
    .single();

  if (updateError) {
    console.error('[POST /approve] DB error:', updateError);
    // Zoho staff was created — return partial success with the ID so it isn't lost
    return NextResponse.json(
      {
        ok:            true,
        warning:       `DB update failed: ${updateError.message} — Zoho staff ID: ${zohoStaffId}`,
        zoho_staff_id: zohoStaffId,
      },
      { status: 207 },
    );
  }

  // Fire-and-forget audit log
  logAuditEvent({
    actor_id:     user.id,
    actor_email:  user.email,
    event_type:   'ally.approved',
    target_type:  'ally',
    target_id:    id,
    target_label: ally.full_name ?? undefined,
    action:       'approved',
    old_value:    { onboarding_status: 'submitted' },
    new_value:    { onboarding_status: 'approved', zoho_staff_id: zohoStaffId },
  });

  return NextResponse.json({ ok: true, ally: updated });
}
