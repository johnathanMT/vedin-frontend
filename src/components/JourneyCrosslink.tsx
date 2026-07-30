import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { JOURNEY_HUB, JOURNEY_INTRO, type JourneyPage } from '../data/journeyHub'

/**
 * JourneyCrosslink — footer strip shown at the bottom of each journey page.
 * Links to the other two chapters with a short narrative blurb.
 *
 * Layout:
 *   xs: single column (stacked cards)
 *   sm+: 2-column grid
 * Touch targets: min-height 60px on mobile so tap area is comfortable.
 */
export default function JourneyCrosslink({ current }: { current: JourneyPage }) {
  const others = JOURNEY_HUB.filter((j) => j.id !== current)

  return (
    <aside
      aria-label="Related chapters"
      className="mx-auto mt-14 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm sm:p-8"
    >
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-light/70">
        Connected chapters
      </p>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-muted">
        {JOURNEY_INTRO}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {others.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              to={item.path}
              className={[
                'group flex min-h-[60px] flex-col gap-2 rounded-xl border border-white/10 p-4 sm:p-5',
                'transition-colors hover:border-white/20 hover:bg-white/[0.05]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light/50',
              ].join(' ')}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <Icon size={15} style={{ color: item.accent }} aria-hidden />
                {item.label}
                <ArrowRight
                  size={13}
                  className="ml-auto shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                  aria-hidden
                />
              </span>
              <span className="text-xs leading-relaxed text-muted sm:text-sm">{item.blurb}</span>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
