'use client'

import { useMemo, useState } from 'react'
import { MarketplacePanel } from '@/components/marketplace-panel'
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  ChevronDown,
  Clock3,
  Heart,
  Menu,
  Play,
  Search,
  Share2,
  Sparkles,
  Tv,
  X,
} from 'lucide-react'

const stories = [
  { category: 'DRAMA', title: 'The red carpet returns: the season’s most talked-about premieres', excerpt: 'From breakout performances to the looks everyone is saving, these are the stories shaping the week.', author: 'Maya Chen', time: '12 min ago', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85', featured: true },
  { category: 'CULTURE', title: 'The new language of joy is loud, local, and entirely online', excerpt: 'A fresh wave of creators is turning everyday rituals into global cultural moments.', author: 'Noor James', time: '38 min ago', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85' },
  { category: 'STYLE', title: 'Why everyone is dressing for the after-party', excerpt: 'The details behind the season’s most expressive style shift.', author: 'Ari Wells', time: '1 hr ago', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85' },
  { category: 'MUSIC', title: 'Five records making the case for the perfect summer soundtrack', excerpt: 'Our editors pick the albums worth hearing from first track to last.', author: 'Theo Grant', time: '2 hrs ago', image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85' },
]

const shows = [
  { time: '09:00', label: 'Scandal Daily', host: 'with Lena Okafor', active: true },
  { time: '12:30', label: 'Culture Club', host: 'with Mateo Ruiz' },
  { time: '18:00', label: 'The Night Shift', host: 'with Ava Morgan' },
]

export default function Page() {
  const [activeTab, setActiveTab] = useState('For you')
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<string[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [liveVotes, setLiveVotes] = useState(12842)
  const [revealed, setRevealed] = useState(false)

  const visibleStories = useMemo(() => {
    const value = query.toLowerCase().trim()
    return stories.filter((story) => {
      const matchesTab = activeTab === 'For you' || activeTab === 'Highlights' || activeTab === 'Live' || story.category === activeTab.toUpperCase()
      const matchesSearch = !value || `${story.title} ${story.category} ${story.excerpt}`.toLowerCase().includes(value)
      return matchesTab && matchesSearch
    })
  }, [activeTab, query])

  const toggleSave = (title: string) => setSaved((current) => current.includes(title) ? current.filter((item) => item !== title) : [...current, title])

  const unlockReveal = async () => {
    try {
      const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purpose: 'reveal-vote' }) })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error ?? 'Checkout unavailable')
      window.location.href = data.url
    } catch {
      setRevealed(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f4f0] text-[#1c1c1a] dark:bg-[#171716] dark:text-[#f5f4f0]">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-black/10 py-6">
          <button aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)} className="rounded-full p-2 transition hover:bg-black/5 lg:hidden">{menuOpen ? <X /> : <Menu />}</button>
          <a href="#" className="font-serif text-3xl tracking-[-0.06em] sm:text-4xl">scandal<span className="text-[#df5c3e]">.</span></a>
          <nav className="hidden items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.18em] lg:flex">
            {['For you', 'Drama', 'Culture', 'Highlights', 'Live'].map((item) => <button key={item} onClick={() => setActiveTab(item)} className={`transition ${activeTab === item ? 'text-[#df5c3e]' : 'text-black/55 hover:text-black'}`}>{item}</button>)}
          </nav>
          <div className="flex items-center gap-2">
            {showSearch && <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search stories" placeholder="Search" className="w-28 border-b border-black/30 bg-transparent px-1 py-2 text-sm outline-none sm:w-40" />}
            <button aria-label={showSearch ? 'Close search' : 'Search'} onClick={() => { setShowSearch(!showSearch); if (showSearch) setQuery('') }} className="rounded-full p-2 transition hover:bg-black/5">{showSearch ? <X /> : <Search />}</button>
            <a href="#community-desk" className="hidden rounded-full bg-[#1c1c1a] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#df5c3e] sm:block">Subscribe</a>
          </div>
        </header>

        <div className="flex gap-5 overflow-x-auto border-b border-black/10 py-4 text-[11px] font-semibold uppercase tracking-[0.17em] lg:hidden">
          {['For you', 'Drama', 'Culture', 'Highlights', 'Live'].map((item) => <button key={item} onClick={() => setActiveTab(item)} className={`whitespace-nowrap ${activeTab === item ? 'text-[#df5c3e]' : 'text-black/45'}`}>{item}</button>)}
        </div>

        <section className="grid gap-9 py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-14">
          <div>
            <div className="mb-8 flex items-end justify-between"><div><p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#df5c3e]"><Sparkles data-icon="inline-start" /> {activeTab === 'For you' ? 'Editor’s picks' : activeTab}</p><h1 className="max-w-2xl font-serif text-4xl leading-[0.96] tracking-[-0.055em] sm:text-7xl">What’s shaping the conversation.</h1></div><span className="hidden pb-1 text-xs text-black/40 sm:block">Thursday, October 23, 2026</span></div>
            {visibleStories.length === 0 ? <div className="border border-dashed border-black/20 p-12 text-center text-black/50">No stories found. Try another search.</div> : <div className="grid gap-5 sm:grid-cols-2">{visibleStories.map((story, index) => <article key={story.title} className={story.featured ? 'group sm:col-span-2' : 'group'}><div className={`relative overflow-hidden bg-black/10 ${story.featured ? 'aspect-[16/8]' : 'aspect-[4/3]'}`}><img src={story.image} alt={story.title} className="size-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />{story.featured && <div className="absolute bottom-0 left-0 max-w-2xl p-5 text-white sm:p-8"><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffb19b]">{story.category}</p><h2 className="font-serif text-3xl leading-none tracking-[-0.04em] sm:text-5xl">{story.title}</h2></div>}</div>{!story.featured && <div className="pt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#df5c3e]">{story.category}</p><h2 className="font-serif text-2xl leading-[1.05] tracking-[-0.03em]">{story.title}</h2><p className="mt-2 text-sm leading-relaxed text-black/55">{story.excerpt}</p></div>}<div className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.13em] text-black/40"><span>{story.author} · {story.time}</span><button aria-label={`Save ${story.title}`} onClick={() => toggleSave(story.title)} className="rounded-full p-2 transition hover:bg-black/5"><Bookmark fill={saved.includes(story.title) ? 'currentColor' : 'none'} className={saved.includes(story.title) ? 'text-[#df5c3e]' : ''} /></button></div></article>)}</div>}
          </div>

          <aside className="lg:pt-24"><div className="border-y border-black/15 py-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-serif text-3xl tracking-[-0.04em]">Live now</h2><span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#df5c3e]"><span className="size-2 rounded-full bg-[#df5c3e]" /> On air</span></div><div className="relative mb-6 aspect-[16/10] overflow-hidden bg-[#243539]"><img src="https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85" alt="Live show studio" className="size-full object-cover opacity-75" /><div className="absolute inset-0 flex items-center justify-center"><button onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause live show' : 'Play live show'} className="flex size-16 items-center justify-center rounded-full bg-white text-[#1c1c1a] transition hover:scale-105">{playing ? <span className="text-lg">Ⅱ</span> : <Play fill="currentColor" />}</button></div><span className="absolute left-3 top-3 bg-[#df5c3e] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white">Live</span></div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#df5c3e]">The daily edit</p><h3 className="mt-2 font-serif text-2xl">The stories behind the story.</h3><p className="mt-2 text-sm leading-relaxed text-black/55">Join our editors for an unfiltered look at what’s moving culture today.</p><button onClick={() => setPlaying(true)} className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em]">{playing ? 'Playing now' : 'Listen live'} <ArrowRight /></button></div><div className="py-6"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl">Today’s lineup</h2><CalendarDays className="text-black/35" /></div><div className="flex flex-col gap-4">{shows.map((show) => <div key={show.time} className={`flex gap-4 border-b border-black/10 pb-4 ${show.active ? 'text-[#df5c3e]' : ''}`}><span className="w-12 text-xs font-semibold">{show.time}</span><div><p className="font-serif text-lg leading-none text-[#1c1c1a]">{show.label}</p><p className="mt-1 text-xs text-black/45">{show.host}</p></div>{show.active && <Tv className="ml-auto" />}</div>)}</div></div></aside>
        </section>

        <section className="border-y border-black/10 py-10 sm:py-12">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#df5c3e]"><span className="size-2 rounded-full bg-[#df5c3e]" /> Live pulse</p><h2 className="font-serif text-4xl tracking-[-0.05em] sm:text-5xl">The room is watching.</h2></div><span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">Audience-powered coverage</span></div>
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <article className="relative overflow-hidden bg-[#243539] p-6 text-white sm:p-8"><div className="absolute inset-0 bg-gradient-to-br from-[#df5c3e]/20 to-transparent" /><div className="relative"><div className="mb-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em]"><span className="text-[#ffb19b]">Breaking dossier</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#ffb19b]" /> Live</span></div><h3 className="max-w-xl font-serif text-3xl leading-none tracking-[-0.04em] sm:text-5xl">The pop star prenup everyone is decoding.</h3><p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">A leaked document has the internet reading between the lines. Vote to reveal the next verified detail.</p><div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"><button onClick={unlockReveal} className="inline-flex items-center justify-center gap-2 bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1c1c1a] transition hover:bg-[#ffb19b]">{revealed ? 'Reveal unlocked' : 'Vote $1 to reveal'} <ArrowRight /></button><span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/55">{liveVotes.toLocaleString()} votes logged</span></div></div></article>
            <div className="flex flex-col justify-between border border-black/15 p-6 sm:p-8"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#df5c3e]">What happens next</p><h3 className="mt-3 font-serif text-3xl leading-tight">From tip to trusted story.</h3><p className="mt-3 text-sm leading-relaxed text-black/55">Every submission is checked against its source, rewritten in our own words, and queued for the live show.</p></div><div className="mt-8 flex flex-col gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-black/55"><div className="flex items-center gap-3 border-t border-black/10 pt-3"><span className="font-serif text-xl text-[#df5c3e]">01</span> Source verified</div><div className="flex items-center gap-3 border-t border-black/10 pt-3"><span className="font-serif text-xl text-[#df5c3e]">02</span> Editor reviewed</div><div className="flex items-center gap-3 border-t border-black/10 pt-3"><span className="font-serif text-xl text-[#df5c3e]">03</span> Audience decides</div></div></div>
          </div>
        </section>

        <section className="border-t border-black/10 py-12"><div className="mb-7 flex items-end justify-between"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#df5c3e]">The quick read</p><h2 className="font-serif text-4xl tracking-[-0.05em]">More to know</h2></div><button onClick={() => setActiveTab('For you')} className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] sm:flex">View all <ArrowRight /></button></div><div className="grid gap-x-8 gap-y-6 md:grid-cols-3">{['The 10-minute guide to this week’s biggest debate', 'Inside the rooms where new ideas become movements', 'The highlights our editors are sending to friends'].map((title, index) => <article key={title} className="flex gap-4 border-t border-black/15 pt-4"><span className="font-serif text-4xl text-black/20">0{index + 1}</span><div><h3 className="font-serif text-xl leading-tight">{title}</h3><div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-black/40"><Clock3 /> 4 min read <Share2 /></div></div></article>)}</div></section>
        <div id="community-desk"><MarketplacePanel /></div>
        <footer className="flex flex-col gap-5 border-t border-black/10 py-8 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45 sm:flex-row sm:items-center sm:justify-between"><span className="font-serif text-2xl normal-case tracking-[-0.06em] text-[#1c1c1a]">scandal<span className="text-[#df5c3e]">.</span></span><span>Independent culture, every day.</span><span>© 2026 Scandal</span></footer>
      </div>
    </main>
  )
}
