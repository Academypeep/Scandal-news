'use client'

import { useState } from 'react'

const PACKAGES = [
  { id: 'signal', name: 'Signal', detail: 'One editorial submission' },
  { id: 'spotlight', name: 'Spotlight', detail: 'Priority editorial review' },
  { id: 'desk', name: 'Desk Pass', detail: 'Premium placement and promotion' },
] as const

export function MarketplacePanel() {
  const [open, setOpen] = useState(false)
  const [packageId, setPackageId] = useState('signal')
  const [form, setForm] = useState({ title: '', category: 'DRAMA', excerpt: '', author: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId, ...form }),
      })
      const result = await response.json()
      if (!response.ok || !result.url) throw new Error(result.error ?? 'Checkout is unavailable right now.')
      if (window.self !== window.top) window.open(result.url, '_blank', 'noopener,noreferrer')
      else window.location.assign(result.url)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Checkout failed. Please retry.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="community-desk" className="border-y border-black/10 py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#df5c3e]">Community desk</p>
          <h2 className="font-serif text-4xl leading-none tracking-[-0.05em] sm:text-5xl">Bring us the detail everyone is missing.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-black/55">Choose a Paddle-powered submission package. Payment confirms the editorial workflow; publication is never guaranteed.</p>
          <button type="button" onClick={() => setOpen((value) => !value)} className="mt-6 bg-[#1c1c1a] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white">{open ? 'Close submission desk' : 'Submit a story'}</button>
        </div>
        {open && <form onSubmit={submit} className="grid gap-4 border border-black/15 p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-3" aria-label="Submission packages">
            {PACKAGES.map((item) => <button type="button" key={item.id} onClick={() => setPackageId(item.id)} className={`border p-4 text-left ${packageId === item.id ? 'border-[#df5c3e] bg-[#df5c3e]/10' : 'border-black/15'}`} aria-pressed={packageId === item.id}><span className="block text-[10px] font-bold uppercase tracking-[0.15em]">{item.name}</span><span className="mt-2 block text-xs text-black/55">{item.detail}</span></button>)}
          </div>
          <label className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">Headline<input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="border-b border-black/20 bg-transparent py-3 text-base font-normal normal-case tracking-normal outline-none focus:border-[#df5c3e]" /></label>
          <label className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">Your read<textarea required maxLength={600} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} className="min-h-24 resize-none border-b border-black/20 bg-transparent py-3 text-base font-normal normal-case tracking-normal outline-none focus:border-[#df5c3e]" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">Byline<input required maxLength={80} value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} className="border-b border-black/20 bg-transparent py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#df5c3e]" /></label><label className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">Section<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="border-b border-black/20 bg-transparent py-3 text-sm font-normal outline-none"><option>DRAMA</option><option>CULTURE</option><option>HIGHLIGHTS</option><option>LIVE</option></select></label></div>
          {error && <p role="alert" className="text-xs leading-relaxed text-[#b42318]">{error}</p>}
          <button type="submit" disabled={loading} className="bg-[#df5c3e] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Opening Paddle checkout…' : 'Continue to Paddle checkout'}</button>
        </form>}
      </div>
    </section>
  )
}
