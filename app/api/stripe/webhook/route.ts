import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get('stripe-signature')
  if (!secret || !webhookSecret || !signature) return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 400 })

  try {
    const stripe = new Stripe(secret)
    const event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret)
    if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') return NextResponse.json({ received: true })

    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status !== 'paid' || session.metadata?.purpose !== 'article-submission') return NextResponse.json({ received: true })

    const packageId = session.metadata.packageId ?? 'signal'
    const amountCents = session.amount_total ?? 0
    await db.transaction(async (tx) => {
      const ledger = await tx.execute(sql`INSERT INTO public.scandal_submission_payments (checkout_session_id, package_id, amount_cents) VALUES (${session.id}, ${packageId}, ${amountCents}) ON CONFLICT (checkout_session_id) DO NOTHING RETURNING checkout_session_id`)
      if (!ledger.rows.length) return
      await tx.execute(sql`INSERT INTO public.scandal_articles (title, category, excerpt, author_name, image_url, status) VALUES (${session.metadata.title}, ${session.metadata.category}, ${session.metadata.excerpt}, ${session.metadata.authorName}, NULL, 'pending')`)
    })
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature or payload.' }, { status: 400 })
  }
}
