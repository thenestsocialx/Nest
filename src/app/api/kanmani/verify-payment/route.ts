import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

// Called client-side immediately after Razorpay confirms a one-time order payment.
// Signature string for orders: razorpay_order_id + "|" + razorpay_payment_id
// (different from subscriptions which use payment_id + "|" + subscription_id)
export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    donor_email,
    donor_name,
  } = body

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
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
  const now = new Date().toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: donation, error } = await (admin as any)
    .from('kanmani_donations')
    .update({
      status: 'captured',
      razorpay_payment_id,
      donor_email: donor_email || null,
      donor_name: donor_name || null,
      updated_at: now,
    })
    .eq('razorpay_order_id', razorpay_order_id)
    .select('amount_inr, sessions_funded')
    .maybeSingle()

  if (error) {
    console.error('[kanmani/verify-payment]', error)
    return NextResponse.json({ error: 'Failed to confirm donation' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    amountInr: donation?.amount_inr ?? 0,
    sessionsFunded: donation?.sessions_funded ?? 0,
  })
}
