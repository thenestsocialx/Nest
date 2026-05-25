import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';

async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.app_metadata?.role === 'admin' ? user : null;
}

/**
 * PATCH /api/v1/zoho/credentials
 *
 * Saves the admin-selected Zoho Bookings workspace to the credentials singleton.
 * Body: { workspace_id: string; workspace_name: string }
 */
export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } },
      { status: 401 },
    );
  }

  let body: { workspace_id?: string; workspace_name?: string };
  try {
    body = (await request.json()) as { workspace_id?: string; workspace_name?: string };
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Request body must be valid JSON.' } },
      { status: 400 },
    );
  }

  const { workspace_id, workspace_name } = body;
  if (!workspace_id || typeof workspace_id !== 'string') {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'workspace_id is required.' } },
      { status: 400 },
    );
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from('zoho_credentials')
    .update({
      workspace_id,
      workspace_name: workspace_name ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'singleton');

  if (error) {
    console.error('[zoho/credentials PATCH] db error:', error.message);
    return NextResponse.json(
      { error: { code: 'UPDATE_FAILED', message: 'Failed to save workspace selection.' } },
      { status: 500 },
    );
  }

  // Fire-and-forget audit log
  logAuditEvent({
    actor_id:     user.id,
    actor_email:  user.email,
    event_type:   'system.zoho_connected',
    target_type:  'system',
    target_label: workspace_name ?? workspace_id,
    action:       'zoho workspace connected',
    new_value:    { workspace_id, workspace_name: workspace_name ?? null },
  });

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/v1/zoho/credentials
 *
 * Disconnects Zoho entirely by removing the credentials singleton row.
 */
export async function DELETE() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Admin access required.' } },
      { status: 401 },
    );
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from('zoho_credentials').delete().eq('id', 'singleton');

  if (error) {
    return NextResponse.json(
      { error: { code: 'DELETE_FAILED', message: 'Failed to disconnect Zoho.' } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
