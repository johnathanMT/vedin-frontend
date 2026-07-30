/**
 * SectionSkeleton — an ultra-light Suspense fallback for lazy below-the-fold
 * sections. No images, no libraries — just a themed shimmer so the page never
 * jumps and the visitor sees a smooth placeholder while the chunk downloads.
 */
export default function SectionSkeleton({ label = 'Loading' }: { label?: string }) {
  return (
    <section className="relative py-24 sm:py-28" aria-busy="true" aria-label={`${label} (loading)`}>
      <div className="mx-auto max-w-5xl px-6">
        <div className="h-3 w-40 animate-pulse rounded bg-jade/15" />
        <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded bg-white/10" />
        <div className="mt-6 h-48 w-full animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
        <span className="sr-only">{label} loading…</span>
      </div>
    </section>
  )
}
