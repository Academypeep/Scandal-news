import Link from 'next/link'

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-[#f5f4f0] px-5 py-10 text-[#1c1c1a] sm:px-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.16em] text-[#df5c3e]">Back to scandal</Link>
        <h1 className="mt-12 font-serif text-5xl tracking-[-0.05em]">Trust & safety</h1>
        <p className="mt-4 max-w-2xl text-black/60">Scandal is an audience-powered newsroom. These policies explain how submissions, payments, moderation, and personal data are handled.</p>
        <div className="mt-12 flex flex-col gap-10">
          <section id="privacy"><h2 className="font-serif text-3xl">Privacy policy</h2><p className="mt-3 leading-relaxed text-black/65">We collect account, submission, and payment status data needed to operate the service. Stripe processes payments; we do not store full card details. We retain published and moderation records for editorial integrity, and you may request access, correction, or deletion through support.</p></section>
          <section id="terms"><h2 className="font-serif text-3xl">Terms of use</h2><p className="mt-3 leading-relaxed text-black/65">Only submit material you have the right to share. Do not submit private personal data, threats, impersonation, fabricated evidence, or unlawful content. Submission fees purchase editorial review, not publication or a guaranteed outcome. Payments are non-refundable after review begins.</p></section>
          <section id="content-policy"><h2 className="font-serif text-3xl">Content and takedown policy</h2><p className="mt-3 leading-relaxed text-black/65">Editors verify sources, label uncertainty, and remove content that is demonstrably false, harmful, infringing, or unlawfully private. Report a story or request a correction through support with the URL, claim, and evidence. Urgent safety concerns are escalated to moderators.</p></section>
          <section id="retention"><h2 className="font-serif text-3xl">Retention and deletion</h2><p className="mt-3 leading-relaxed text-black/65">You can request deletion of your account and unpublished submissions. We may retain payment and moderation records where required for fraud prevention, legal compliance, or newsroom accountability.</p></section>
          <section id="support"><h2 className="font-serif text-3xl">Support</h2><p className="mt-3 leading-relaxed text-black/65">For privacy requests, corrections, reports, refunds, or account deletion, email support@scandal.example with the subject “Scandal request”.</p></section>
        </div>
      </div>
    </main>
  )
}
