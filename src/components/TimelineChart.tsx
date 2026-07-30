import { memo } from 'react'
import type { YearForecast } from '../types/astrology'
import type { Lang } from '../lib/vedin'

/**
 * TimelineChart — whole-life star-rating (1–5) as an SVG area/line graph over age.
 * Sade Sati years shaded coral, Mahadasha changes marked with the lord abbr, and
 * the current age highlighted. Theme-aware via CSS vars.
 */
const ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
}

function TimelineChart({ timeline, currentAge, lang }: { timeline: YearForecast[]; currentAge: number; lang: Lang }) {
  if (!timeline.length) return null
  const W = 720, H = 240, ML = 34, MR = 14, MT = 26, MB = 26
  const plotW = W - ML - MR, plotH = H - MT - MB
  const maxAge = timeline[timeline.length - 1].age || 80
  const x = (age: number) => ML + (age / maxAge) * plotW
  const y = (stars: number) => MT + (1 - stars / 5) * plotH

  const pts = timeline.map((t) => [x(t.age), y(t.stars)] as [number, number])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${x(maxAge).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`

  // Contiguous Sade Sati bands.
  const bands: [number, number][] = []
  for (let i = 0; i < timeline.length; i++) {
    if (timeline[i].sadeSati) {
      const s = timeline[i].age; let e = s
      while (i + 1 < timeline.length && timeline[i + 1].sadeSati) { i++; e = timeline[i].age }
      bands.push([s, e])
    }
  }
  const changes = timeline.filter((t, i) => i > 0 && t.maha !== timeline[i - 1].maha)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Life star-rating timeline">
      {bands.map(([s, e], k) => (
        <rect key={k} x={x(s)} y={MT} width={Math.max(x(e) - x(s), 3)} height={plotH} style={{ fill: 'rgb(var(--coral) / 0.12)' }} />
      ))}
      {[1, 2, 3, 4, 5].map((s) => (
        <g key={s}>
          <line x1={ML} y1={y(s)} x2={W - MR} y2={y(s)} style={{ stroke: 'rgb(var(--fg) / 0.08)' }} strokeWidth={1} />
          <text x={ML - 6} y={y(s) + 3} textAnchor="end" fontSize={9} fontFamily="monospace" style={{ fill: 'rgb(var(--muted))' }}>{s}★</text>
        </g>
      ))}
      {Array.from({ length: Math.floor(maxAge / 10) + 1 }, (_, k) => k * 10).map((age) => (
        <text key={age} x={x(age)} y={H - 8} textAnchor="middle" fontSize={9} fontFamily="monospace" style={{ fill: 'rgb(var(--muted))' }}>{age}</text>
      ))}
      <path d={area} style={{ fill: 'rgb(var(--accent) / 0.16)' }} />
      <path d={line} fill="none" style={{ stroke: 'rgb(var(--accent))' }} strokeWidth={1.8} />
      {changes.map((t, k) => (
        <g key={k}>
          <line x1={x(t.age)} y1={MT} x2={x(t.age)} y2={MT + plotH} style={{ stroke: 'rgb(var(--fg) / 0.14)' }} strokeWidth={1} strokeDasharray="2 3" />
          <text x={x(t.age)} y={MT - 6} textAnchor="middle" fontSize={9} fontWeight={600} fontFamily="monospace" style={{ fill: 'rgb(var(--muted))' }}>{ABBR[t.maha] ?? t.maha.slice(0, 2)}</text>
        </g>
      ))}
      {currentAge >= 0 && currentAge <= maxAge && (
        <g>
          <line x1={x(currentAge)} y1={MT} x2={x(currentAge)} y2={MT + plotH} style={{ stroke: 'rgb(var(--accent))' }} strokeWidth={1.4} />
          <circle cx={x(currentAge)} cy={y(timeline.find((t) => t.age === currentAge)?.stars ?? 3)} r={3.6} style={{ fill: 'rgb(var(--accent))' }} />
          <text x={x(currentAge)} y={H - 8} textAnchor="middle" fontSize={9} fontWeight={600} fontFamily="monospace" style={{ fill: 'rgb(var(--accent))' }}>{lang === 'mm' ? 'ယခု' : 'now'}</text>
        </g>
      )}
    </svg>
  )
}

export default memo(TimelineChart)
