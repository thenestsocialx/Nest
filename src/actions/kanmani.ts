'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getRazorpay } from '@/lib/razorpay'

export async function createDonationOrder(amountInr: number): Promise<
  | { success: true; orderId: string; amount: number; keyId: string }
  | { success: false; error: string }
> {
  if (!Number.isInteger(amountInr) || amountInr < 1) {
    return { success: false, error: 'Invalid amount.' }
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  if (!keyId) return { success: false, error: 'Payment is not configured.' }

  try {
    const rzp = getRazorpay()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await (rzp.orders as any).create({
      amount: amountInr * 100, // paise
      currency: 'INR',
      receipt: `kanmani_${Date.now()}`,
      notes: { fund: 'kanmani' },
    })

    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('kanmani_donations').insert({
      razorpay_order_id: order.id,
      amount_inr: amountInr,
      status: 'created',
    })

    return { success: true, orderId: order.id as string, amount: amountInr * 100, keyId }
  } catch (err) {
    console.error('[createDonationOrder]', err)
    return { success: false, error: 'Could not create payment. Please try again.' }
  }
}
