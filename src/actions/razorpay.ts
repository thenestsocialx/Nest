'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRazorpay } from '@/lib/razorpay'

// ── Initiate a new Razorpay subscription ─────────────────────────────────────
// Returns the subscription ID + public key so the client can open the payment modal.
// Does NOT redirect — the client controls the modal flow.
export async function initiateSubscription(planId: string): Promise<
  | { success: true; subscriptionId: string; keyId: string }
  | { success: false; error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  if (!keyId) return { success: false, error: 'Payment provider is not configured.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: planRow } = await (supabase as any)
    .from('plans')
    .select('razorpay_plan_id, name')
    .eq('id', planId)
    .maybeSingle()

  const razorpayPlanId = planRow?.razorpay_plan_id as string | null
  if (!razorpayPlanId) {
    return {
      success: false,
      error: `Plan "${planId}" is not linked to Razorpay yet. Please contact support.`,
    }
  }

  const admin = createAdminClient()

  try {
    const rzp = getRazorpay()

    // Upsert Razorpay customer — store ID on profile to avoid creating duplicates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (admin as any)
      .from('profiles')
      .select('razorpay_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    let customerId: string | null = profile?.razorpay_customer_id ?? null

    if (!customerId) {
      // fail_existing: 0 → don't error if this email already has a Razorpay customer
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customer = await rzp.customers.create({ name: user.email!.split('@')[0], email: user.email!, fail_existing: 0 }) as any
      customerId = customer.id as string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from('profiles')
        .update({ razorpay_customer_id: customerId })
        .eq('id', user.id)
    }

    // customer_id is a valid Razorpay API field that the SDK type omits — cast to bypass
    // total_count: 120 = 10 years of monthly billing (effectively open-ended)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = await rzp.subscriptions.create({ plan_id: razorpayPlanId, customer_id: customerId, total_count: 120, quantity: 1, customer_notify: 1 } as any) as any
    const subscriptionId = subscription.id as string

    // Persist the subscription so webhook events can be matched to users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('subscriptions').upsert({
      id: subscriptionId,
      user_id: user.id,
      plan_id: planId,
      status: 'created',
      razorpay_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })

    return { success: true, subscriptionId, keyId }
  } catch (err) {
    console.error('[initiateSubscription]', err)
    return { success: false, error: 'Failed to create subscription. Please try again.' }
  }
}

// ── Cancel active subscription at end of current billing period ───────────────
export async function cancelSubscription(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sub } = await (admin as any)
    .from('subscriptions')
    .select('id, status, cancel_at_period_end')
    .eq('user_id', user.id)
    .in('status', ['active', 'authenticated'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!sub) return { error: 'No active subscription found.' }
  if (sub.cancel_at_period_end) return { error: 'Subscription is already scheduled for cancellation.' }

  try {
    const rzp = getRazorpay()
    // true = cancel at end of current billing cycle so user keeps access until period ends
    await rzp.subscriptions.cancel(sub.id as string, true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('subscriptions')
      .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq('id', sub.id)

    return {}
  } catch (err) {
    console.error('[cancelSubscription]', err)
    return { error: 'Failed to cancel subscription. Please try again or contact support.' }
  }
}
