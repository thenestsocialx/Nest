// GET  /api/v1/sessions — Fetch the authenticated user's sessions (upcoming + past)
// POST /api/v1/sessions — Create a session connection request
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from('sessions')
    .select(`
      id,
      status,
      created_at,
      zoho_booking_id,
      request_message,
      allies (
        id,
        display_name,
        primary_role,
        photo_url,
        tagline,
        zoho_embed_url
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/v1/sessions]', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }

  const UPCOMING_STATUSES = new Set(['pending', 'requested', 'confirmed']);
  const upcoming = (rows ?? []).filter(r => UPCOMING_STATUSES.has(r.status));
  const past     = (rows ?? []).filter(r => !UPCOMING_STATUSES.has(r.status));

  return NextResponse.json({ upcoming, past });
}

const bodySchema = z.object({
  ally_id: z.string().uuid(),
  message: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse & validate body ────────────────────────────────────
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const admin = createAdminClient();

  // ── Verify ally is active and searchable ─────────────────────
  const { data: ally, error: allyErr } = await admin
    .from('allies')
    .select('id, display_name, is_active, onboarding_status, deleted_at')
    .eq('id', body.ally_id)
    .single();

  if (allyErr || !ally || !ally.is_active || ally.onboarding_status !== 'active' || ally.deleted_at) {
    return NextResponse.json({ error: 'Ally not available' }, { status: 404 });
  }

  // ── Prevent duplicate requests ───────────────────────────────
  const { data: existing } = await admin
    .from('sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('ally_id', body.ally_id)
    .eq('status', 'requested')
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'Already requested' }, { status: 400 });
  }

  // ── Create session request ───────────────────────────────────
  const { data: session, error: insertErr } = await admin
    .from('sessions')
    .insert({
      user_id: user.id,
      ally_id: body.ally_id,
      status: 'requested',
      request_message: body.message ?? null,
    })
    .select('id')
    .single();

  if (insertErr || !session) {
    console.error('[POST /api/v1/sessions]', insertErr);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }

  // ── Audit log ────────────────────────────────────────────────
  await logAuditEvent({
    event_type: 'session_requested',
    actor_id: user.id,
    actor_email: user.email ?? '',
    actor_role: 'user',
    action: `Requested connection with ${ally.display_name}`,
    target_type: 'session',
    target_id: session.id,
    target_label: ally.display_name ?? body.ally_id,
  });

  return NextResponse.json({ session_id: session.id }, { status: 201 });
}
