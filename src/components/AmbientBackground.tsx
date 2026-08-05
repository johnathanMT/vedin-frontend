/**
 * AmbientBackground — a single, extremely subtle warm-gold wash at the top of the
 * page. This replaces the old psychedelic rainbow smoke-orbs (cyan/magenta/red/
 * yellow) that read as a "sci-fi/AI glow"; the premium look is grounded, so this is
 * deliberately near-invisible — just enough to keep the top edge from feeling flat.
 * Sits behind everything (-z-10); the page's own solid background covers most of it.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 left-1/2 h-[32rem] w-[42rem] -translate-x-1/2 rounded-full bg-amber-500/[0.04] blur-[160px] dark:bg-amber-500/[0.06]" />
    </div>
  )
}
