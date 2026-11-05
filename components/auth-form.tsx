'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const result = mode === 'sign-up'
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })
    setLoading(false)
    if (result.error) {
      setError('We could not authenticate those details. Please try again.')
      return
    }
    router.push('/')
    router.refresh()
  }

  return <form onSubmit={submit} className="mx-auto grid w-full max-w-md gap-4 border border-black/15 p-6">
    <h1 className="font-serif text-4xl">{mode === 'sign-up' ? 'Create account' : 'Welcome back'}</h1>
    {mode === 'sign-up' && <label className="grid gap-2 text-sm">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="border-b border-black/20 bg-transparent p-2 outline-none" /></label>}
    <label className="grid gap-2 text-sm">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border-b border-black/20 bg-transparent p-2 outline-none" /></label>
    <label className="grid gap-2 text-sm">Password<input required minLength={8} type="password" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="border-b border-black/20 bg-transparent p-2 outline-none" /></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button disabled={loading} className="bg-[#1c1c1a] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white disabled:opacity-60">{loading ? 'Working…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button>
  </form>
}
