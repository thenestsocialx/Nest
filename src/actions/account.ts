'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRazorpay } from '@/lib/razorpay'

// ── Delete account ────────────────────────────────────────────────────────────
// 1. Cancels any active Razorpay subscription immediately (not at period end).
// 2. Signs out the current session to clear auth cookies.
// 3. Hard-deletes the auth user — cascades to profiles and all related rows.
export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()

  // Cancel active Razorpay subscription immediately — fire-and-forget errors
  // so a payment provider failure never blocks account deletion.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sub } = await (admin as any)
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['active', 'authenticated', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sub?.id) {
      const rzp = getRazorpay()
      // false = cancel immediately, not at period end
      await rzp.subscriptions.cancel(sub.id as string, false)
    }
  } catch (err) {
    console.error('[deleteAccount] Razorpay cancellation error (non-blocking):', err)
  }

  // Clear the auth session cookies before deleting the user.
  // This prevents stale cookie state on the client after redirect.
  await supabase.auth.signOut()

  // Delete the auth user — Supabase cascades this to the profiles row
  // and any other tables with ON DELETE CASCADE on user_id → auth.users.
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    console.error('[deleteAccount] deleteUser failed:', error)
    return { error: 'Failed to delete account. Please try again or contact support.' }
  }

  return {}
}
