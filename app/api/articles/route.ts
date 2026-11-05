import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT id, title, category, excerpt, author_name AS "authorName", image_url AS "imageUrl", votes_count AS "votesCount", created_at AS "createdAt" FROM public.scandal_articles WHERE status = 'approved' ORDER BY created_at DESC LIMIT 50`)
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: 'Articles are temporarily unavailable.' }, { status: 503 })
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Paid submissions are fulfilled by the Paddle webhook.' }, { status: 405 })
}

