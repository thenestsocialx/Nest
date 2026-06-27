import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Called client-side immediately after the Razorpay modal reports a successful payment.
// Verifies the payment signature before updating the DB — prevents forged success callbacks.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  // Verify HMAC-SHA256: razorpay_payment_id | razorpay_subscription_id
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex')

  let isValid = false
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(razorpay_signature, 'hex'),
    )
  } catch {
    isValid = false
  }

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Confirm the subscription belongs to this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sub } = await (admin as any)
    .from('subscriptions')
    .select('id, plan_id')
    .eq('id', razorpay_subscription_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  const now = new Date().toISOString()

  // Optimistically mark as authenticated; webhook subscription.activated will set 'active'
  await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any)
      .from('subscriptions')
      .update({ status: 'authenticated', updated_at: now })
      .eq('id', sub.id),
    admin
      .from('profiles')
      .update({ plan: sub.plan_id, subscription_status: 'active', updated_at: now })
      .eq('id', user.id),
  ])

  return NextResponse.json({ success: true })
}
