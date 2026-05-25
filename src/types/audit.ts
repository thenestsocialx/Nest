// ══════════════════════════════════════════════════════════════
// Nest · Audit Log Types
// ══════════════════════════════════════════════════════════════

export type AuditEventType =
  // Ally lifecycle
  | 'ally.submitted'
  | 'ally.approved'
  | 'ally.rejected'
  | 'ally.activated'
  | 'ally.paused'
  | 'ally.reactivated'
  // Client management
  | 'client.plan_changed'
  | 'client.safety_flag_set'
  | 'client.safety_flag_cleared'
  | 'client.credits_adjusted'
  | 'client.subscription_changed'
  // System events
  | 'system.zoho_connected'
  | 'system.zoho_sync';

export interface AuditLog {
  id: string;
  event_type: AuditEventType | string;
  actor_id: string | null;
  actor_email: string | null;
  actor_role: string;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
