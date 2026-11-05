import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db, pool } from '@/lib/db'

const baseURL = process.env.BETTER_AUTH_URL
  ? process.env.BETTER_AUTH_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL

const exactOrigins = [
  baseURL,
  'http://localhost:3000',
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
].filter((origin): origin is string => Boolean(origin))

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  baseURL,
  trustedOrigins: [...new Set(exactOrigins)],
  emailAndPassword: { enabled: true },
  advanced: process.env.NODE_ENV === 'development'
    ? { defaultCookieAttributes: { sameSite: 'none', secure: true } }
    : undefined,
})

export { pool }
