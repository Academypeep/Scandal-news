import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 503 })

  try {
    const body = await request.json().catch(() => ({}))
    const purpose = body?.purpose === 'reveal-vote' ? body.purpose : null
    if (!purpose) return NextResponse.json({ error: 'A valid vote purpose is required.' }, { status: 400 })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const requestOrigin = request.headers.get('origin')
    const configuredOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null
    const origin = configuredOrigin ?? requestOrigin ?? 'http://localhost:3000'
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Scandal reveal vote' }, unit_amount: 100 }, quantity: 1 }],
      success_url: `${origin}/?reveal=unlocked`,
      cancel_url: `${origin}/?reveal=cancelled`,
      metadata: { purpose },
    })
    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'We could not start checkout. Please try again.' }, { status: 500 })
  }
}
