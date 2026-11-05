import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"
import { sql } from "drizzle-orm"
import { db } from "@/lib/db"

function verifySignature(rawBody: string, signature: string | null) {
  if (!signature || !process.env.PADDLE_WEBHOOK_SECRET) return false
  const parts = Object.fromEntries(signature.split(";").map((part) => part.split("=", 2)))
  if (!parts.ts || !parts.h1) return false
  const expected = createHmac("sha256", process.env.PADDLE_WEBHOOK_SECRET).update(`${parts.ts}:${rawBody}`).digest("hex")
  const provided = Buffer.from(parts.h1, "hex")
  const calculated = Buffer.from(expected, "hex")
  return provided.length === calculated.length && timingSafeEqual(provided, calculated)
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  if (!verifySignature(rawBody, request.headers.get("paddle-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  try {
    const event = JSON.parse(rawBody)
    const transaction = event?.data
    const transactionId = transaction?.id
    const customData = transaction?.custom_data
    if (!transactionId || !customData?.title || event?.event_type !== "transaction.completed") {
      return NextResponse.json({ received: true })
    }

    const inserted = await db.execute(sql`
      INSERT INTO public.scandal_payments (provider, provider_transaction_id, package_id, status, payload)
      VALUES ('paddle', ${transactionId}, ${customData.packageId ?? "signal"}, 'completed', ${JSON.stringify(event)}::jsonb)
      ON CONFLICT (provider, provider_transaction_id) DO NOTHING
      RETURNING id
    `)
    if (!inserted.rows.length) return NextResponse.json({ received: true, duplicate: true })

    await db.execute(sql`
      INSERT INTO public.scandal_articles (title, category, excerpt, author_name, image_url, status)
      VALUES (${customData.title}, ${customData.category ?? "DRAMA"}, ${customData.excerpt ?? ""}, ${customData.author ?? "Anonymous"}, NULL, 'pending')
    `)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Paddle webhook fulfillment failed", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
