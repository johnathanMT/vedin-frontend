import { NavLink } from 'react-router-dom'
import { JOURNEY_HUB, type JourneyPage } from '../data/journeyHub'

/**
 * JourneyHubNav — pill navigation shared across /bibliography, /studying, /python.
 *
 * Mobile: horizontally scrollable single row — no wrapping, no text overflow.
 * Desktop: centred flex row with visible "Switch chapter" label.
 * Touch targets: min 44 × 44 px per WCAG 2.5.5.
 */
export default function JourneyHubNav({ active }: { active: JourneyPage }) {
  return (
    <nav
      aria-label="Journey chapter navigation"
      className="mx-auto mb-8 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md"
    >
      <div className="flex items-center gap-0 overflow-x-auto px-3 py-2 sm:justify-center sm:gap-2 sm:px-5 sm:py-3">
        {/* Label — hidden on the narrowest phones to save space */}
        <span
          className="mr-2 hidden shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 sm:inline"
          aria-hidden="true"
        >
          Switch chapter
        </span>

        {JOURNEY_HUB.map((item) => {
          const Icon = item.icon
          const isActive = item.id === active
          return (
            <NavLink
              key={item.id}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={({ isActive: routeActive }) =>
                [
                  // min-h + min-w ensure 44 px touch target on mobile
                  'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all',
                  'min-h-[44px] min-w-[44px] sm:min-h-0',
                  routeActive || isActive
                    ? 'border-white/25 bg-white/10 text-white shadow-[0_2px_12px_rgba(0,0,0,0.4)]'
                    : 'border-transparent text-white/50 hover:border-white/15 hover:bg-white/[0.05] hover:text-white/80',
                ].join(' ')
              }
              style={
                isActive
                  ? { boxShadow: `0 0 18px ${item.accent}40, 0 2px 12px rgba(0,0,0,0.4)` }
                  : undefined
              }
            >
              <Icon
                size={15}
                style={{ color: isActive ? item.accent : undefined }}
                aria-hidden="true"
              />
              <span className="whitespace-nowrap">{item.short}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
