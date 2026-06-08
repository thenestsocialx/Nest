'use server'

import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key)
}

export async function createCheckoutSession(planId: string): Promise<never> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const priceId =
    planId === 'core'
      ? process.env.STRIPE_CORE_PRICE_ID
      : process.env.STRIPE_PREMIUM_PRICE_ID

  if (!priceId) throw new Error(`Price ID for plan "${planId}" is not configured`)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/plans?success=1`,
    cancel_url: `${appUrl}/plans`,
    metadata: { user_id: user.id },
  })

  redirect(session.url!)
}

export async function createBillingPortalSession(): Promise<never> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const stripe = getStripe()

  // Look up existing customer by email
  const customers = await stripe.customers.list({ email: user.email!, limit: 1 })
  const customer = customers.data[0]

  if (!customer) {
    // No Stripe customer yet — fall back to plans page
    redirect('/plans')
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${appUrl}/plans`,
  })

  redirect(portal.url)
}
