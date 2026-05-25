// ══════════════════════════════════════════════════════════════
// Nest · Audit Log Helper
// SERVER ONLY — never import in browser code
// ══════════════════════════════════════════════════════════════
//
// Fire-and-forget: a logging failure MUST NOT break the primary action.
// Always call without `await` unless you explicitly need to confirm the write.

import { createAdminClient } from '@/lib/supabase/admin';

export interface AuditEventParams {
  actor_id: string;
  actor_email?: string | null;
  actor_role?: string;
  event_type: string;
  target_type?: string;
  target_id?: string;
  target_label?: string;
  action: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from('audit_logs').insert({
      event_type:   params.event_type,
      actor_id:     params.actor_id,
      actor_email:  params.actor_email ?? null,
      actor_role:   params.actor_role ?? 'admin',
      target_type:  params.target_type ?? null,
      target_id:    params.target_id ?? null,
      target_label: params.target_label ?? null,
      action:       params.action,
      old_value:    params.old_value ?? null,
      new_value:    params.new_value ?? null,
      metadata:     params.metadata ?? null,
    });
    if (error) {
      console.error('[logAuditEvent] Supabase error:', error.message);
    }
  } catch (err) {
    console.error('[logAuditEvent] Unexpected error:', err);
  }
}
