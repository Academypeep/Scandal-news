import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 503 })
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const origin = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Scandal reveal vote' }, unit_amount: 100 }, quantity: 1 }], success_url: `${origin}/?reveal=unlocked`, cancel_url: `${origin}/?reveal=cancelled`, metadata: { purpose: 'reveal-vote' } })
  return NextResponse.json({ url: session.url })
}
