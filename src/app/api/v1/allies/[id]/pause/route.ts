// POST /api/v1/allies/[id]/pause
// Pauses an active ally: sets is_active=false and turns off all visibility flags.
// Requires admin. Ally must be in "active" state with is_active=true.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
      { error: `Cannot pause — ally is not active (current status: "${ally.onboarding_status}").` },
      { status: 409 },
    );
  }

  if (!ally.is_active) {
    // Already paused — idempotent
    return NextResponse.json({ ok: true, already_paused: true });
  }

  const { data: updated, error: updateError } = await admin
    .from('allies')
    .update({
      is_active:            false,
      visibility_search:    false,
      visibility_bookings:  false,
      visibility_matching:  false,
      visibility_featured:  false,
    })
    .eq('id', id)
    .select('id, full_name, is_active, onboarding_status')
    .single();

  if (updateError) {
    console.error('[POST /pause]', updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ally: updated });
}
