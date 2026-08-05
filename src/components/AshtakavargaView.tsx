import { memo } from 'react'
import type { BirthChartData } from '../types/astrology'
import { signLabel, planetName, type Lang } from '../lib/vedin'

/**
 * AshtakavargaView — Sarvashtakavarga (SAV) per-sign bindu strip + the full
 * Bhinnashtakavarga (BAV) table (7 planets × 12 signs). High SAV signs are
 * strong for transits, low signs weak. Theme-aware.
 */
const PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']

function AshtakavargaView({ data, lang }: { data: BirthChartData; lang: Lang }) {
  const av = data.ashtakavarga
  if (!av?.sav?.length) return null
  const maxSav = Math.max(...av.sav, 1)
  // Grounded strength scale: strong = sage, weak = dim neutral (faded), mid = gold.
  // No red — strength reads through emphasis, not a traffic-light palette.
  const col = (v: number) => (v >= 30 ? 'rgb(var(--jade))' : v <= 25 ? 'rgb(115 115 115)' : 'rgb(var(--accent))')

  return (
    <div className="space-y-5">
      <div className="glass-card p-5">
        <h3 className="mb-1 font-groovy text-lg text-fg">{lang === 'ja' ? 'アシュタカヴァルガ' : lang === 'mm' ? 'အဋ္ဌကဝဂ် (Ashtakavarga)' : 'Ashtakavarga'}</h3>
        <p className="text-sm leading-relaxed text-muted">
          {lang === 'ja'
            ? '星座ごとの吉点（ビンドゥ）。SAV ≥ 30 で強、≤ 25 で弱。ビンドゥの多い星座を惑星が通過するほど、その結果はより十分に現れます。'
            : lang === 'mm'
            ? 'ရာသီတစ်ခုချင်း၏ မင်္ဂလာအမှတ် (bindu)။ SAV ≥ ၃၀ = အားကောင်း၊ ≤ ၂၅ = အားနည်း။ ဂြိုဟ်သွား အားကောင်း/နည်းကို ဤအမှတ်များက ဆုံးဖြတ်သည်။'
            : 'Benefic points (bindus) per sign. SAV ≥ 30 = strong, ≤ 25 = weak. A planet transiting a high-bindu sign gives fuller results.'}
        </p>
      </div>

      {/* SAV strip */}
      <div className="glass-card overflow-x-auto p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex min-w-[560px] items-end gap-1.5">
          {av.sav.map((v, s) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono text-xs font-semibold" style={{ color: col(v) }}>{v}</span>
              <div className="flex h-24 w-full items-end rounded bg-white/5">
                <div className="w-full rounded" style={{ height: `${(v / maxSav) * 100}%`, background: col(v) }} />
              </div>
              <span className="font-mono text-[10px] text-muted">{signLabel(s, lang)}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-right font-mono text-[11px] text-muted">SAV total: {av.sav.reduce((a, b) => a + b, 0)} / 337</p>
      </div>

      {/* BAV table — horizontally swipeable on mobile; the local scroll is contained
          so it never drags the whole page sideways. */}
      <div className="glass-card w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2 scrollbar-hide touch-pan-x p-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full min-w-[640px] border-collapse text-center text-xs">
          <thead className="font-mono text-[10px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-2 py-2.5 text-left">{lang === 'ja' ? '惑星' : lang === 'mm' ? 'ဂြိုဟ်' : 'Planet'}</th>
              {Array.from({ length: 12 }, (_, s) => <th key={s} className="px-2 py-2.5">{signLabel(s, lang)}</th>)}
            </tr>
          </thead>
          <tbody>
            {PLANETS.map((p) => (
              <tr key={p} className="border-t border-white/5">
                <td className="px-2 py-2 text-left font-medium text-fg/90">{planetName(p, lang)}</td>
                {(av.bav[p] ?? []).map((v, s) => <td key={s} className="px-2 py-2 font-mono text-fg/80">{v}</td>)}
              </tr>
            ))}
            <tr className="border-t border-white/10 bg-white/[0.03]">
              <td className="px-2 py-2 text-left font-mono text-[11px] uppercase tracking-wider text-accent-light">SAV</td>
              {av.sav.map((v, s) => <td key={s} className="px-2 py-2 font-mono font-semibold" style={{ color: col(v) }}>{v}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default memo(AshtakavargaView)
