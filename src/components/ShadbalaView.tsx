import { memo } from 'react'
import type { BirthChartData, PlanetStrength } from '../types/astrology'
import { planetName, type Lang } from '../lib/vedin'

/**
 * ShadbalaView — the six balas per planet (Sthana, Dig, Kala, Cheshta,
 * Naisargika, Drik) in virupas, with total rupas vs the classical required
 * minimum and a sufficiency badge. Responsive table.
 */
const ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']
type BalaKey = 'sthanaBala' | 'digBala' | 'kalaBala' | 'cheshtaBala' | 'naisargikaBala' | 'drikBala'
const COLS: { key: BalaKey; en: string; mm: string }[] = [
  { key: 'sthanaBala', en: 'Sthana', mm: 'ဌာန' },
  { key: 'digBala', en: 'Dig', mm: 'ဒိဂ်' },
  { key: 'kalaBala', en: 'Kala', mm: 'ကာလ' },
  { key: 'cheshtaBala', en: 'Cheshta', mm: 'စေဋ္ဌ' },
  { key: 'naisargikaBala', en: 'Naisargika', mm: 'နိသရ္ဂ' },
  { key: 'drikBala', en: 'Drik', mm: 'ဒြိဋ်' },
]

// React.memo: props (data, lang) only change on a new chart load, so this heavy
// 7×6 table never re-renders on unrelated parent state changes (chat input, geo search).
function ShadbalaView({ data, lang }: { data: BirthChartData; lang: Lang }) {
  const rows = ORDER
    .map((n) => ({ n, s: data.planets.find((p) => p.name === n)?.strength as PlanetStrength | null | undefined }))
    .filter((r): r is { n: string; s: PlanetStrength } => !!r.s)
  if (!rows.length) return null
  const maxR = Math.max(...rows.map((r) => r.s.totalRupas), 1)

  return (
    <div className="space-y-5">
      <div className="glass-card p-5">
        <h3 className="mb-1 font-groovy text-lg text-fg">{lang === 'ja' ? 'シャドバラ — 六種の強さ' : lang === 'mm' ? 'ဆဒ္ဗလ (Shadbala)' : 'Shadbala — Six Strengths'}</h3>
        <p className="text-sm leading-relaxed text-muted">
          {lang === 'ja'
            ? '各惑星の六種の強さ（ヴィルパ）。合計ルパ（Rupas）が必要最低値以上であれば、その惑星は十分に強いといえます（✓）。60ヴィルパ = 1ルパ。'
            : lang === 'mm'
            ? 'ဂြိုဟ်တစ်လုံးချင်း၏ အား ၆ မျိုး (ဗီရုပ)။ စုစုပေါင်း ရူပ (Rupas) ≥ လိုအပ်သောပမာဏ ဆိုလျှင် ဂြိုဟ်အားလုံလောက် (✓)။'
            : "Each planet's six sources of strength (virupas). If total Rupas ≥ the required minimum, the planet is strong enough (✓). 60 virupas = 1 rupa."}
        </p>
      </div>

      <div className="glass-card w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2 scrollbar-hide touch-pan-x p-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full min-w-[720px] border-collapse text-center text-xs">
          <thead className="font-mono text-[10px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-3 py-2.5 text-left">{lang === 'ja' ? '惑星' : lang === 'mm' ? 'ဂြိုဟ်' : 'Planet'}</th>
              {COLS.map((c) => <th key={c.key} className="px-2 py-2.5">{lang === 'mm' ? c.mm : c.en}</th>)}
              <th className="px-2 py-2.5">{lang === 'ja' ? '合計' : lang === 'mm' ? 'စုစုပေါင်း' : 'Total'}</th>
              <th className="px-2 py-2.5">{lang === 'ja' ? '必要' : lang === 'mm' ? 'လိုအပ်' : 'Req'}</th>
              <th className="px-2 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ n, s }) => (
              <tr key={n} className="border-t border-white/5">
                <td className="px-3 py-2 text-left font-medium text-fg/90">{planetName(n, lang)}</td>
                {COLS.map((c) => <td key={c.key} className="px-2 py-2 font-mono text-fg/70">{s[c.key]}</td>)}
                <td className="px-2 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-semibold text-accent-light">{s.totalRupas}</span>
                    <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-white/10 sm:block">
                      <span className="block h-full rounded-full" style={{ width: `${(s.totalRupas / maxR) * 100}%`, background: s.sufficient ? 'rgb(var(--jade))' : 'rgb(var(--coral))' }} />
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2 font-mono text-muted">{s.requiredRupas}</td>
                <td className="px-2 py-2">
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${s.sufficient ? 'bg-jade/15 text-jade' : 'bg-coral/15 text-coral'}`}>{s.sufficient ? '✓' : '✗'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default memo(ShadbalaView)
