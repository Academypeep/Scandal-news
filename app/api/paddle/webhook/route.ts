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
    const eventType = event?.event_type
    const customData = transaction?.custom_data
    if (!transactionId) return NextResponse.json({ received: true })
    if (eventType !== "transaction.completed") {
      const status = eventType === "transaction.canceled" ? "canceled" : eventType === "transaction.payment_failed" ? "failed" : eventType === "transaction.billed" ? "billed" : null
      if (status) await db.execute(sql`UPDATE public.scandal_payments SET status = ${status}, payload = ${JSON.stringify(event)}::jsonb WHERE provider = 'paddle' AND provider_transaction_id = ${transactionId}`)
      return NextResponse.json({ received: true })
    }
    if (!customData?.title) return NextResponse.json({ error: "Missing submission metadata" }, { status: 400 })

    const category = typeof customData.category === "string" ? customData.category.toUpperCase() : ""
    if (!['DRAMA', 'CULTURE', 'HIGHLIGHTS', 'LIVE'].includes(category)) return NextResponse.json({ error: "Invalid submission category" }, { status: 400 })

    const fulfilled = await db.transaction(async (tx) => {
      const inserted = await tx.execute(sql`
        INSERT INTO public.scandal_payments (provider, provider_transaction_id, package_id, status, payload)
        VALUES ('paddle', ${transactionId}, ${customData.packageId ?? "signal"}, 'completed', ${JSON.stringify(event)}::jsonb)
        ON CONFLICT (provider, provider_transaction_id) DO NOTHING
        RETURNING id
      `)
      if (!inserted.rows.length) return false
      await tx.execute(sql`
        INSERT INTO public.scandal_articles (title, category, excerpt, author_name, image_url, status)
        VALUES (${customData.title}, ${category}, ${customData.excerpt ?? ""}, ${customData.author ?? "Anonymous"}, NULL, 'pending')
      `)
      return true
    })
    if (!fulfilled) return NextResponse.json({ received: true, duplicate: true })
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Paddle webhook fulfillment failed", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
