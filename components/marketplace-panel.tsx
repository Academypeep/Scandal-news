'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, Check, Send, Sparkles } from 'lucide-react'

export function MarketplacePanel() {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ title: '', excerpt: '', authorName: '', category: 'DRAMA' })
  const [error, setError] = useState('')
  const [packageId, setPackageId] = useState('signal')
  const packages = [
    { id: 'signal', name: 'Signal', price: '$1', detail: 'One article submission' },
    { id: 'spotlight', name: 'Spotlight', price: '$5', detail: 'Priority editorial review' },
    { id: 'desk', name: 'Desk Pass', price: '$15', detail: 'Three submissions this month' },
  ]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('submission') !== 'unlocked') return
    const sessionId = params.get('session_id')
    if (!sessionId) { setError('Payment completed, but the submission receipt was missing. Please contact the editors.'); return }
    fetch('/api/articles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
      .then(response => { if (!response.ok) throw new Error('Submission failed'); setSubmitted(true); setOpen(true); window.history.replaceState({}, '', '/') })
      .catch(() => setError('Payment went through, but we could not send the story. Please contact the editors.'))
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purpose: 'article-submission', packageId, article: form }) })
    const result = await response.json()
    if (!response.ok || !result.url) { sessionStorage.removeItem('scandal-submission'); setError(result.error ?? 'Checkout is unavailable right now.'); return }
    window.location.assign(result.url)
  }

  return <section className="border-y border-black/10 py-10 sm:py-14">
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <div><p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#df5c3e]"><Sparkles /> Community desk</p><h2 className="font-serif text-4xl leading-none tracking-[-0.05em] sm:text-5xl">Bring us the detail everyone is missing.</h2><p className="mt-4 max-w-md text-sm leading-relaxed text-black/55">Submit a tip, a cultural signal, or a first-hand account. Choose a monthly package to support verification and decide how quickly your story reaches the room.</p><button onClick={() => setOpen(!open)} className="mt-6 inline-flex items-center gap-2 bg-[#1c1c1a] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white">{open ? 'Close submission desk' : 'Submit a story'} <ArrowRight /></button></div>
      {open && <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2" aria-label="Monthly submission packages">{packages.map(item => <button type="button" key={item.id} onClick={() => setPackageId(item.id)} className={`text-left border p-4 transition-colors ${packageId === item.id ? 'border-[#df5c3e] bg-[#df5c3e]/8' : 'border-black/15 hover:border-black/40'}`}><span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em]"><span>{item.name}</span><span>{item.price}</span></span><span className="mt-2 block text-xs text-black/55">{item.detail}</span></button>)}</div>}
      {open && <form onSubmit={submit} className="grid gap-4 border border-black/15 p-5 sm:p-7"><label className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">Headline<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="border-b border-black/20 bg-transparent py-3 text-base font-normal normal-case tracking-normal outline-none focus:border-[#df5c3e]" placeholder="What should the room know?" /></label><label className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">Your read<textarea required value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="min-h-24 resize-none border-b border-black/20 bg-transparent py-3 text-base font-normal normal-case tracking-normal outline-none focus:border-[#df5c3e]" placeholder="Share the verified detail, context, or signal." /></label><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">Byline<input required value={form.authorName} onChange={e => setForm({ ...form, authorName: e.target.value })} className="border-b border-black/20 bg-transparent py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#df5c3e]" placeholder="Your name" /></label><label className="grid gap-2 text-[10px] font-bold uppercase tracking-[0.15em]">Section<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border-b border-black/20 bg-transparent py-3 text-sm font-normal outline-none"><option>DRAMA</option><option>CULTURE</option><option>STYLE</option><option>MUSIC</option><option>HIGHLIGHTS</option></select></label></div>{error && <p role="alert" className="text-xs leading-relaxed text-[#b42318]">{error}</p>}<button disabled={submitted} className="mt-2 inline-flex items-center justify-center gap-2 bg-[#df5c3e] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-60">{submitted ? <><Check /> Sent for review</> : <><Send /> Pay $1 &amp; send to editors</>}</button></form>}
    </div>
  </section>
}
