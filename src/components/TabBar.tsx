import { ScrollText } from 'lucide-react'
import { m, LayoutGroup } from 'framer-motion'
import type { Lang } from '../lib/vedin'
import type { ChartStyle, Tab } from '../lib/vedin-content'

export interface TabDef {
  id: Tab
  label: string
  variant?: 'main' | 'ashtaka' | 'shadbala'
}

interface Props {
  lang: Lang
  tabs: TabDef[]
  tab: Tab
  onTab: (t: Tab) => void
  chartStyle: ChartStyle
  onChartStyle: (s: ChartStyle) => void
}

// The active indicator is ONE element shared across all tabs (framer-motion
// layoutId). When the active tab changes, framer springs that single pill from
// the old tab's box to the new one instead of cross-fading two backgrounds —
// the hallmark "shared layout" motion. Its gradient is picked from the active
// tab's variant, so the colour morphs mid-flight: amber for readings, indigo
// for Ashtaka, rose for Shadbala. Under prefers-reduced-motion the pill simply
// snaps (MotionConfig reducedMotion="user" in MotionProvider).
type Key = 'main' | 'ashtaka' | 'shadbala' | 'default'
const keyOf = (v?: TabDef['variant']): Key => v ?? 'default'

const PILL_GRADIENT: Record<Key, string> = {
  main: 'linear-gradient(90deg, #f59e0b, #facc15)',
  ashtaka: 'linear-gradient(90deg, #6366f1, #2563eb)',
  shadbala: 'linear-gradient(90deg, #f43f5e, #db2777)',
  default: 'linear-gradient(90deg, #f59e0b, #facc15)',
}
const PILL_SHADOW: Record<Key, string> = {
  main: '0 8px 24px -8px rgba(245,158,11,0.55)',
  ashtaka: '0 8px 24px -8px rgba(79,70,229,0.55)',
  shadbala: '0 8px 24px -8px rgba(244,63,94,0.55)',
  default: '0 8px 24px -8px rgba(245,158,11,0.55)',
}
// Faded (inactive) label colour per variant, so unselected tabs still carry a hint
// of their section's colour.
const FADED: Record<Key, string> = {
  main: 'text-amber-700/70 dark:text-amber-200/70',
  ashtaka: 'text-indigo-700/70 dark:text-indigo-200/70',
  shadbala: 'text-rose-700/70 dark:text-rose-200/70',
  default: 'text-muted',
}
// Active label sits on the coloured pill: dark ink on the bright amber pill in
// dark mode, white on the deeper indigo/rose ones.
const ACTIVE_TEXT: Record<Key, string> = {
  main: 'text-white dark:text-amber-950',
  ashtaka: 'text-white',
  shadbala: 'text-white',
  default: 'text-white dark:text-amber-950',
}

export default function TabBar({ lang, tabs, tab, onTab, chartStyle, onChartStyle }: Props) {
  return (
    <div className="no-print sticky top-14 z-30 -mx-1 border-b border-accent/20 px-1 py-2.5 backdrop-blur-md sm:top-16"
      style={{ background: 'rgb(var(--space) / 0.85)' }}>
      <div className="flex items-center gap-2">
        <LayoutGroup id="vedin-tabs">
          <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap py-0.5" role="tablist">
            {tabs.map((tb) => {
              const active = tab === tb.id
              const key = keyOf(tb.variant)
              return (
                <button
                  key={tb.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onTab(tb.id)}
                  className={`relative shrink-0 rounded-full border px-5 py-2 font-groovy text-sm transition-colors duration-200 ${active
                    ? `border-transparent font-bold ${ACTIVE_TEXT[key]}`
                    : `border-white/12 bg-white/5 font-medium opacity-70 hover:opacity-100 ${FADED[key]}`}`}
                >
                  {active && (
                    <m.span
                      layoutId="vedin-tab-pill"
                      className="absolute inset-0 z-0 rounded-full"
                      style={{ background: PILL_GRADIENT[key], boxShadow: PILL_SHADOW[key] }}
                      transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tb.variant === 'main' && <ScrollText size={15} />} {tb.label}
                  </span>
                </button>
              )
            })}
          </div>
        </LayoutGroup>

        {(tab === 'd1' || tab === 'vargas') && (
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
            {(['diamond', 'grid'] as ChartStyle[]).map((s) => (
              <button key={s} type="button" onClick={() => onChartStyle(s)}
                className={`rounded-full px-2.5 py-1 font-mono text-[11px] transition ${chartStyle === s ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>
                {s === 'diamond' ? (lang === 'mm' ? 'စိန်ပုံစံ' : 'Diamond') : (lang === 'mm' ? 'ဇယားကွက်ပုံစံ' : 'Grid')}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
