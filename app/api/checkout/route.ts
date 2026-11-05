import { NextResponse } from "next/server"
import { createHash } from "node:crypto"
import { sql } from "drizzle-orm"
import { db } from "@/lib/db"

const PACKAGES = {
  signal: { priceId: process.env.PADDLE_SIGNAL_PRICE_ID, name: "Signal submission" },
  spotlight: { priceId: process.env.PADDLE_SPOTLIGHT_PRICE_ID, name: "Spotlight submission" },
  desk: { priceId: process.env.PADDLE_DESK_PRICE_ID, name: "Desk submission" },
} as const

type PackageId = keyof typeof PACKAGES

function isPackageId(value: unknown): value is PackageId {
  return typeof value === "string" && value in PACKAGES
}

const categories = new Set(["DRAMA", "CULTURE", "HIGHLIGHTS", "LIVE"])
const paddleBaseUrl = process.env.PADDLE_ENVIRONMENT === "sandbox" ? "https://sandbox-api.paddle.com" : "https://api.paddle.com"

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0)
    if (contentLength > 20_000) return NextResponse.json({ error: "Submission is too large." }, { status: 413 })
    const body = await request.json()
    const packageId = body?.packageId
    const title = typeof body?.title === "string" ? body.title.trim() : ""
    const category = typeof body?.category === "string" ? body.category.trim() : ""
    const excerpt = typeof body?.excerpt === "string" ? body.excerpt.trim() : ""
    const author = typeof body?.author === "string" ? body.author.trim() : ""

    if (!isPackageId(packageId) || !title || title.length > 160 || !categories.has(category.toUpperCase()) || !excerpt || excerpt.length > 600 || !author || author.length > 80) {
      return NextResponse.json({ error: "Valid package and submission details are required." }, { status: 400 })
    }

    const selected = PACKAGES[packageId]
    if (!selected.priceId) {
      return NextResponse.json({ error: "This package is not configured for checkout yet." }, { status: 503 })
    }
    if (!process.env.PADDLE_API_KEY) {
      return NextResponse.json({ error: "Paddle checkout is not configured." }, { status: 503 })
    }

    const origin = process.env.APP_URL ?? new URL(request.url).origin
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const recent = await db.execute(sql`SELECT COUNT(*)::int AS count FROM public.scandal_checkout_attempts WHERE ip = ${ip} AND created_at > NOW() - INTERVAL '1 hour'`)
    if (Number(recent.rows[0]?.count ?? 0) >= 10) return NextResponse.json({ error: "Too many checkout attempts. Try again later." }, { status: 429 })
    const requestKey = request.headers.get("idempotency-key")?.trim()
    const fingerprint = createHash("sha256").update(`${requestKey ?? ""}:${packageId}:${title}:${excerpt}:${author}`).digest("hex")
    await db.execute(sql`INSERT INTO public.scandal_checkout_attempts (fingerprint, ip) VALUES (${fingerprint}, ${ip})`)
    const response = await fetch(`${paddleBaseUrl}/transactions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `scandal-${fingerprint}`,
      },
      body: JSON.stringify({
        items: [{ price_id: selected.priceId, quantity: 1 }],
        collection_mode: "automatic",
        checkout: { url: `${origin}/?checkout=complete&transaction_id={transaction_id}` },
        custom_data: { packageId, title, category, excerpt, author },
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      console.error("[v0] Paddle transaction creation failed", { status: response.status, requestId: payload?.meta?.request_id })
      return NextResponse.json({ error: "Paddle could not create checkout. Please retry." }, { status: 502 })
    }

    const checkoutUrl = payload?.data?.checkout?.url
    if (!checkoutUrl) return NextResponse.json({ error: "Paddle returned no checkout URL." }, { status: 502 })
    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error("[v0] Paddle checkout error", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 500 })
  }
}
