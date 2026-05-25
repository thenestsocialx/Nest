// GET  /api/v1/clients/[id] — Fetch single client profile
// PATCH /api/v1/clients/[id] — Update plan, credits, safety flag, subscription status
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';
import type { ClientPatchPayload } from '@/types/client';

const PATCHABLE_FIELDS = new Set<string>([
  'plan',
  'credits',
  'safety_flag',
  'safety_flag_reason',
  'subscription_status',
]);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== 'admin') return null;
  return user;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Get email from auth
  const { data: { user: authUser } } = await admin.auth.admin.getUserById(id);

  return NextResponse.json({
    client: {
      ...profile,
      email: authUser?.email ?? null,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Whitelist fields
  const updates: ClientPatchPayload = {};
  for (const [key, value] of Object.entries(body)) {
    if (PATCHABLE_FIELDS.has(key)) {
      (updates as Record<string, unknown>)[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Fetch current state for audit log diff
  const { data: before } = await admin
    .from('profiles')
    .select('plan, credits, safety_flag, safety_flag_reason, subscription_status, full_name, display_name')
    .eq('id', id)
    .single();

  const { data, error } = await admin
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('id, plan, credits, safety_flag, safety_flag_reason, subscription_status, full_name, updated_at')
    .single();

  if (error) {
    console.error('[PATCH /api/v1/clients/:id]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── Determine audit event type ────────────────────────────────
  let eventType = 'client.updated';
  if ('plan' in updates)            eventType = 'client.plan_changed';
  else if ('credits' in updates)    eventType = 'client.credits_adjusted';
  else if ('subscription_status' in updates) eventType = 'client.subscription_changed';
  else if ('safety_flag' in updates) {
    eventType = updates.safety_flag ? 'client.safety_flag_set' : 'client.safety_flag_cleared';
  }

  const targetLabel = before?.full_name ?? before?.display_name ?? id;

  // Fire-and-forget audit log
  logAuditEvent({
    actor_id:     user.id,
    actor_email:  user.email,
    event_type:   eventType,
    target_type:  'client',
    target_id:    id,
    target_label: targetLabel ?? undefined,
    action:       Object.keys(updates).join(', '),
    old_value:    before as Record<string, unknown>,
    new_value:    updates as Record<string, unknown>,
  });

  return NextResponse.json({ ok: true, ...data });
}
