import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

// Register this in Razorpay Dashboard → Webhooks:
//   {APP_URL}/api/kanmani/webhook
// Events: payment.captured, payment.failed
// Use RAZORPAY_KANMANI_WEBHOOK_SECRET or fall back to RAZORPAY_WEBHOOK_SECRET.

function verifySignature(body: string, signature: string): boolean {
  const secret =
    process.env.RAZORPAY_KANMANI_WEBHOOK_SECRET ??
    process.env.RAZORPAY_WEBHOOK_SECRET
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
  const entity = event.payload?.payment?.entity
  const orderId: string | undefined = entity?.order_id

  if (!orderId) return NextResponse.json({ received: true })

  if (eventName === 'payment.captured') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('kanmani_donations')
      .update({
        status: 'captured',
        razorpay_payment_id: entity?.id ?? null,
        updated_at: now,
      })
      .eq('razorpay_order_id', orderId)
      .eq('status', 'created') // skip if verify-payment already captured it
  }

  if (eventName === 'payment.failed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from('kanmani_donations')
      .update({ status: 'failed', updated_at: now })
      .eq('razorpay_order_id', orderId)
      .eq('status', 'created')
  }

  return NextResponse.json({ received: true })
}
