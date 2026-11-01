import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const submissionPackages = {
  signal: { name: 'Signal', amount: 100 },
  spotlight: { name: 'Spotlight', amount: 500 },
  desk: { name: 'Desk Pass', amount: 1500 },
} as const

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 503 })

  try {
    const body = await request.json().catch(() => ({}))
    const purpose = body?.purpose === 'reveal-vote' || body?.purpose === 'article-submission' ? body.purpose : null
    if (!purpose) return NextResponse.json({ error: 'A valid checkout purpose is required.' }, { status: 400 })

    const packageId = typeof body?.packageId === 'string' ? body.packageId : 'signal'
    const article = body?.article && typeof body.article === 'object' ? body.article : null
    const selectedPackage = submissionPackages[packageId as keyof typeof submissionPackages]
    if (purpose === 'article-submission' && !selectedPackage) return NextResponse.json({ error: 'Choose a valid submission package.' }, { status: 400 })
    if (purpose === 'article-submission') {
      const title = typeof article?.title === 'string' ? article.title.trim() : ''
      const excerpt = typeof article?.excerpt === 'string' ? article.excerpt.trim() : ''
      const authorName = typeof article?.authorName === 'string' ? article.authorName.trim() : ''
      const category = typeof article?.category === 'string' ? article.category.trim().toUpperCase() : ''
      if (!title || !excerpt || !authorName || title.length > 180 || excerpt.length > 600 || authorName.length > 80 || !['DRAMA', 'CULTURE', 'HIGHLIGHTS', 'LIVE'].includes(category)) {
        return NextResponse.json({ error: 'Complete the submission form before checkout.' }, { status: 400 })
      }
    }

    const productName = purpose === 'article-submission' ? `Scandal ${selectedPackage?.name ?? 'Signal'} submission package` : 'Scandal reveal vote'
    const amount = purpose === 'article-submission' ? (selectedPackage?.amount ?? 100) : 100

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const configuredOrigin = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null
    const origin = configuredOrigin ?? new URL(request.url).origin
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price_data: { currency: 'usd', product_data: { name: productName }, unit_amount: amount }, quantity: 1 }],
      success_url: purpose === 'article-submission' ? `${origin}/?submission=unlocked&session_id={CHECKOUT_SESSION_ID}` : `${origin}/?reveal=unlocked`,
      cancel_url: purpose === 'article-submission' ? `${origin}/?submission=cancelled` : `${origin}/?reveal=cancelled`,
      metadata: {
        purpose,
        ...(purpose === 'article-submission' && article ? {
          title: String(article.title).trim(),
          excerpt: String(article.excerpt).trim(),
          authorName: String(article.authorName).trim(),
          category: String(article.category).trim().toUpperCase(),
          packageId,
        } : {}),
      },
      idempotencyKey: `scandal_${purpose}_${crypto.randomUUID()}`,
      integration_identifier: `scandal_checkout_${Math.random().toString(36).slice(2, 10)}`,
    })
    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'We could not start checkout. Please try again.' }, { status: 500 })
  }
}
