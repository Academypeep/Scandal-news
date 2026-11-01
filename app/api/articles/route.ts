import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

const categories = new Set(['DRAMA', 'CULTURE', 'HIGHLIGHTS', 'LIVE'])

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT id, title, category, excerpt, author_name AS "authorName", image_url AS "imageUrl", votes_count AS "votesCount", created_at AS "createdAt" FROM public.scandal_articles WHERE status = 'approved' ORDER BY created_at DESC LIMIT 50`)
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Articles are temporarily unavailable.' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
    if (!sessionId || !process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'A completed submission payment is required.' }, { status: 402 })
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid' || session.metadata?.purpose !== 'article-submission') return NextResponse.json({ error: 'A completed submission payment is required.' }, { status: 402 })
    const paidArticle = session.metadata
    const title = typeof paidArticle.title === 'string' ? paidArticle.title.trim() : ''
    const excerpt = typeof paidArticle.excerpt === 'string' ? paidArticle.excerpt.trim() : ''
    const authorName = typeof paidArticle.authorName === 'string' ? paidArticle.authorName.trim() : ''
    const category = typeof paidArticle.category === 'string' ? paidArticle.category.trim().toUpperCase() : 'DRAMA'
    const imageUrl = ''
    const validImageUrl = imageUrl && (imageUrl.startsWith('https://') || imageUrl.startsWith('http://')) ? imageUrl : null

    if (!title || !excerpt || !authorName || title.length > 180 || excerpt.length > 600 || authorName.length > 80 || !categories.has(category)) {
      return NextResponse.json({ error: 'Please provide a valid title, summary, byline, and category.' }, { status: 400 })
    }

    const result = await db.execute(sql`INSERT INTO public.scandal_articles (title, category, excerpt, author_name, image_url, status) VALUES (${title}, ${category}, ${excerpt}, ${authorName}, ${validImageUrl}, 'pending') RETURNING id`)
    return NextResponse.json({ id: result.rows[0]?.id, status: 'pending' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'We could not submit this article.' }, { status: 500 })
  }
}
