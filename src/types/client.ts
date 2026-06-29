// ══════════════════════════════════════════════════════════════
// Nest · Client (User) Types
// ══════════════════════════════════════════════════════════════

export type ClientPlan = 'free' | 'core' | 'premium';
export type ClientSubscriptionStatus = 'active' | 'payment_failed' | 'cancelled' | 'paused';

export interface ClientRow {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  primary_concern: string | null;
  preferred_language: string;
  onboarding_completed: boolean;
  nila_onboarded: boolean;

  // ── Plan / Billing ───────────────────────────────────────────
  plan: ClientPlan;
  credits: number;
  nila_message_count: number;
  subscription_status: ClientSubscriptionStatus;

  // ── Safety ──────────────────────────────────────────────────
  safety_flag: boolean;
  safety_flag_reason: string | null;

  // ── Activity ─────────────────────────────────────────────────
  last_active_at: string | null;
  created_at: string;
  updated_at: string;

  // ── Joined from auth.users ───────────────────────────────────
  email?: string;
}

/** Fields the PATCH endpoint accepts */
export type ClientPatchPayload = Partial<Pick<ClientRow,
  | 'plan'
  | 'credits'
  | 'safety_flag'
  | 'safety_flag_reason'
  | 'subscription_status'
>>;
