import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export default function SignUpPage() {
  return <main className="min-h-screen bg-[#f5f4f0] px-5 py-16 text-[#1c1c1a]"><Link href="/" className="mx-auto mb-10 block max-w-md text-xs font-bold uppercase tracking-[0.16em] text-[#df5c3e]">Back to scandal</Link><AuthForm mode="sign-up" /><p className="mx-auto mt-5 max-w-md text-center text-sm text-black/60">Already have an account? <Link href="/sign-in" className="font-semibold underline">Sign in</Link></p></main>
}
