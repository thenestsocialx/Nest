import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

// Razorpay sends ALL subscription lifecycle events here.
// Register this URL in Razorpay Dashboard → Webhooks:
//   {NEXT_PUBLIC_APP_URL}/api/razorpay/webhook
// Events to subscribe to:
//   subscription.activated, subscription.charged, subscription.completed,
//   subscription.cancelled, subscription.halted, subscription.paused,
//   subscription.resumed, payment.failed

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex'),
    )
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: Record<string, any>
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName: string = event.event ?? ''
  const admin = createAdminClient()
  const now = new Date().toISOString()

  // ── Payment failed ────────────────────────────────────────────────────────
  if (eventName === 'payment.failed') {
    const paymentEntity = event.payload?.payment?.entity
    const subId: string | undefined = paymentEntity?.subscription_id
    if (subId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: sub } = await (admin as any)
        .from('subscriptions')
        .select('user_id')
        .eq('id', subId)
        .maybeSingle()

      if (sub?.user_id) {
        await admin
          .from('profiles')
          .update({ subscription_status: 'payment_failed', updated_at: now })
          .eq('id', sub.user_id)
      }
    }
    return NextResponse.json({ received: true })
  }

  // ── All other events are subscription events ──────────────────────────────
  const entity = event.payload?.subscription?.entity
  if (!entity) return NextResponse.json({ received: true })

  const subId: string = entity.id

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sub } = await (admin as any)
    .from('subscriptions')
    .select('id, user_id, plan_id')
    .eq('id', subId)
    .maybeSingle()

  // Silently ack events for subscriptions not in our DB (created outside the app)
  if (!sub) return NextResponse.json({ received: true })

  switch (eventName) {
    case 'subscription.activated': {
      const start = entity.current_start
        ? new Date(entity.current_start * 1000).toISOString()
        : now
      const end = entity.current_end
        ? new Date(entity.current_end * 1000).toISOString()
        : null

      await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any).from('subscriptions').update({
          status: 'active',
          current_period_start: start,
          current_period_end: end,
          raw_payload: entity,
          updated_at: now,
        }).eq('id', subId),
        admin.from('profiles').update({
          plan: sub.plan_id,
          subscription_status: 'active',
          updated_at: now,
        }).eq('id', sub.user_id),
      ])
      break
    }

    case 'subscription.charged': {
      // Successful recurring payment — refresh the billing period window
      const start = entity.current_start
        ? new Date(entity.current_start * 1000).toISOString()
        : now
      const end = entity.current_end
        ? new Date(entity.current_end * 1000).toISOString()
        : null

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any).from('subscriptions').update({
        status: 'active',
        current_period_start: start,
        current_period_end: end,
        cancel_at_period_end: false,
        raw_payload: entity,
        updated_at: now,
      }).eq('id', subId)
      break
    }

    case 'subscription.cancelled': {
      await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any).from('subscriptions').update({
          status: 'cancelled',
          raw_payload: entity,
          updated_at: now,
        }).eq('id', subId),
        admin.from('profiles').update({
          plan: 'free',
          subscription_status: 'cancelled',
          updated_at: now,
        }).eq('id', sub.user_id),
      ])
      break
    }

    case 'subscription.completed': {
      // All billing cycles exhausted (total_count reached)
      await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any).from('subscriptions').update({
          status: 'completed',
          raw_payload: entity,
          updated_at: now,
        }).eq('id', subId),
        admin.from('profiles').update({
          plan: 'free',
          subscription_status: 'cancelled',
          updated_at: now,
        }).eq('id', sub.user_id),
      ])
      break
    }

    case 'subscription.halted': {
      // Razorpay exhausted all payment retries — downgrade user
      await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any).from('subscriptions').update({
          status: 'halted',
          raw_payload: entity,
          updated_at: now,
        }).eq('id', subId),
        admin.from('profiles').update({
          plan: 'free',
          subscription_status: 'payment_failed',
          updated_at: now,
        }).eq('id', sub.user_id),
      ])
      break
    }

    case 'subscription.paused': {
      await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any).from('subscriptions').update({
          status: 'paused',
          raw_payload: entity,
          updated_at: now,
        }).eq('id', subId),
        admin.from('profiles').update({
          subscription_status: 'paused',
          updated_at: now,
        }).eq('id', sub.user_id),
      ])
      break
    }

    case 'subscription.resumed': {
      await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin as any).from('subscriptions').update({
          status: 'active',
          raw_payload: entity,
          updated_at: now,
        }).eq('id', subId),
        admin.from('profiles').update({
          subscription_status: 'active',
          updated_at: now,
        }).eq('id', sub.user_id),
      ])
      break
    }

    default:
      // Unknown event — ack without action
      break
  }

  return NextResponse.json({ received: true })
}
