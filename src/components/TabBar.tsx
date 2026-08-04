import { ScrollText } from 'lucide-react'
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

// Active tabs are unmistakable: larger, bold, raised, strongly coloured and
// scaled up. Inactive tabs are faded, to maximise the contrast between them.
const ACTIVE_AMBER = 'scale-105 border-amber-300 bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-2.5 text-lg font-bold text-white shadow-lg shadow-amber-500/40 dark:text-amber-950'

export default function TabBar({ lang, tabs, tab, onTab, chartStyle, onChartStyle }: Props) {
  return (
    <div className="no-print sticky top-14 z-30 -mx-1 border-b border-accent/20 px-1 py-2.5 backdrop-blur-md sm:top-16"
      style={{ background: 'rgb(var(--space) / 0.85)' }}>
      <div className="flex items-center gap-2">
        <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto whitespace-nowrap py-0.5" role="tablist">
          {tabs.map((tb) => {
            const active = tab === tb.id
            const common = { key: tb.id, type: 'button' as const, role: 'tab', 'aria-selected': active, onClick: () => onTab(tb.id) }

            if (tb.variant === 'main') return (
              <button {...common}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 font-groovy transition-all duration-200 ${active
                  ? ACTIVE_AMBER
                  : 'border-amber-400/40 bg-amber-400/5 px-5 py-2 text-sm font-medium text-amber-700/70 opacity-70 hover:opacity-100 dark:text-amber-200/70'}`}>
                <ScrollText size={active ? 18 : 15} /> {tb.label}
              </button>
            )

            if (tb.variant === 'ashtaka' || tb.variant === 'shadbala') {
              const grad = tb.variant === 'ashtaka'
                ? (active ? 'from-indigo-500 to-blue-600 shadow-indigo-500/40' : 'from-indigo-400/20 to-blue-500/10')
                : (active ? 'from-rose-500 to-pink-600 shadow-rose-500/40' : 'from-rose-400/20 to-pink-500/10')
              const faded = tb.variant === 'ashtaka' ? 'text-indigo-700/70 dark:text-indigo-200/70' : 'text-rose-700/70 dark:text-rose-200/70'
              return (
                <button {...common}
                  className={`shrink-0 rounded-full border bg-gradient-to-r font-groovy transition-all duration-200 ${active
                    ? `scale-105 border-white/25 px-6 py-2.5 text-lg font-bold text-white shadow-lg ${grad}`
                    : `border-white/10 px-5 py-2 text-sm font-medium opacity-70 hover:opacity-100 ${grad} ${faded}`}`}>
                  {tb.label}
                </button>
              )
            }

            return (
              <button {...common}
                className={`shrink-0 rounded-full border font-groovy transition-all duration-200 ${active
                  ? ACTIVE_AMBER
                  : 'border-white/12 bg-white/5 px-5 py-2 text-sm font-medium text-muted opacity-70 hover:opacity-100 hover:text-fg'}`}>
                {tb.label}
              </button>
            )
          })}
        </div>

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
