import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

export async function GET() {
  const result = await db.execute(sql`SELECT id, title, category, excerpt, author_name AS "authorName", image_url AS "imageUrl", votes_count AS "votesCount", created_at AS "createdAt" FROM public.scandal_articles WHERE status = 'approved' ORDER BY created_at DESC LIMIT 50`)
  return NextResponse.json(result.rows)
}

export async function POST(request: Request) {
  const body = await request.json()
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : ''
  const authorName = typeof body.authorName === 'string' ? body.authorName.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim().toUpperCase() : 'DRAMA'
  if (!title || !excerpt || !authorName || title.length > 180 || excerpt.length > 600 || authorName.length > 80) return NextResponse.json({ error: 'Please provide a valid title, summary, and byline.' }, { status: 400 })
  const result = await db.execute(sql`INSERT INTO public.scandal_articles (title, category, excerpt, author_name, image_url, status) VALUES (${title}, ${category}, ${excerpt}, ${authorName}, ${typeof body.imageUrl === 'string' ? body.imageUrl : null}, 'pending') RETURNING id`)
  return NextResponse.json({ id: result.rows[0]?.id, status: 'pending' }, { status: 201 })
}
