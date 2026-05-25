// POST /api/v1/allies/[id]/submit
// Final submission of the onboarding form.
// Validates required fields and marks the ally as "submitted" for admin review.
// NOTE: Zoho staff is NOT created here — it is created at the /approve step,
//       so Zoho only ever contains allies who have been vetted and approved.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Admin-only
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch full ally record
  const { data: ally, error: fetchError } = await admin
    .from('allies')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !ally) {
    return NextResponse.json({ error: 'Ally not found' }, { status: 404 });
  }

  // Idempotent — already submitted or further along
  if (['submitted', 'approved', 'active'].includes(ally.onboarding_status)) {
    return NextResponse.json({
      ok:              true,
      already_submitted: true,
      onboarding_status: ally.onboarding_status,
    });
  }

  // Server-side validation of required fields
  const missing: string[] = [];
  if (!ally.full_name?.trim())    missing.push('Full name (Step 1)');
  if (!ally.email?.trim())        missing.push('Email (Step 1)');
  if (!ally.phone?.trim())        missing.push('Phone (Step 1)');
  if (!ally.pronouns)             missing.push('Pronouns (Step 1)');
  if (!ally.location?.trim())     missing.push('Location (Step 1)');
  if (!ally.tagline?.trim())      missing.push('Tagline (Step 1)');
  if (!ally.quote?.trim())        missing.push('Quote (Step 1)');
  if (!ally.primary_role)         missing.push('Role (Step 2)');
  if (!ally.session_durations?.length) missing.push('Session durations (Step 3)');
  if (!ally.session_price)        missing.push('Session price (Step 3)');

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(', ')}` },
      { status: 400 },
    );
  }

  // Mark as submitted — Zoho staff will be created when admin approves
  const { data: updated, error: updateError } = await admin
    .from('allies')
    .update({
      onboarding_status: 'submitted',
      onboarding_step:   5,
    })
    .eq('id', id)
    .select('id, onboarding_status, onboarding_step')
    .single();

  if (updateError) {
    console.error('[POST /submit] DB error:', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Fire-and-forget audit log
  logAuditEvent({
    actor_id:     user.id,
    actor_email:  user.email,
    event_type:   'ally.submitted',
    target_type:  'ally',
    target_id:    id,
    target_label: ally.full_name ?? undefined,
    action:       'submitted for review',
    old_value:    { onboarding_status: ally.onboarding_status },
    new_value:    { onboarding_status: 'submitted' },
  });

  return NextResponse.json({ ok: true, ally: updated });
}
