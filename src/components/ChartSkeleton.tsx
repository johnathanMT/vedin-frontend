import type { CSSProperties } from 'react'
import type { Lang } from '../lib/vedin'

/**
 * Shown while the chart is being computed. A spinner communicates "waiting";
 * a skeleton in the shape of the result communicates "your chart is arriving",
 * which measurably lowers perceived latency at identical server time.
 * Honours prefers-reduced-motion via Tailwind's motion-safe variant.
 */
const shimmer = 'motion-safe:animate-pulse rounded-lg bg-fg/[0.07]'

export default function ChartSkeleton({ lang }: { lang: Lang }) {
  return (
    <div className="glass-card p-5 no-print sm:p-6" role="status" aria-live="polite">
      <span className="sr-only">{lang === 'ja' ? 'ホロスコープを作成中' : lang === 'mm' ? 'ဇာတာ တွက်ချက်နေပါသည်' : 'Casting your chart'}</span>

      {/* four summary tiles mirroring ChartSummaryHero */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
            <div className={`${shimmer} h-3 w-16`} />
            <div className={`${shimmer} mt-2.5 h-5 w-20`} />
            <div className={`${shimmer} mt-1.5 h-2.5 w-14`} />
          </div>
        ))}
      </div>

      {/* tab strip */}
      <div className="mt-5 flex gap-2 overflow-hidden">
        {[20, 16, 16, 14, 18, 15].map((w, i) => (
          <div key={i} className={`${shimmer} h-8 shrink-0 rounded-full`} style={{ width: `${w * 5}px` }} />
        ))}
      </div>

      {/* the chart plate itself — a diamond board being drawn */}
      <div className="mt-5 flex justify-center">
        <svg viewBox="0 0 320 320" className="w-full max-w-md" aria-hidden="true">
          <rect x={1} y={1} width={318} height={318} rx={6} fill="rgb(var(--fg) / 0.03)"
            stroke="rgb(var(--accent) / 0.25)" strokeWidth={1.6} />
          {[
            'M1 1 L319 319', 'M319 1 L1 319',
            'M160 1 L319 160', 'M319 160 L160 319', 'M160 319 L1 160', 'M1 160 L160 1',
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke="rgb(var(--accent) / 0.35)" strokeWidth={1}
              className="chart-skeleton-stroke" style={{ '--d': `${i * 0.12}s` } as CSSProperties} />
          ))}
        </svg>
      </div>
    </div>
  )
}
