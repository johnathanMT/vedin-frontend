import { memo } from 'react'
import type { BirthChartData, PlanetPosition } from '../types/astrology'

/**
 * KundliChart — South-Indian style Rasi chart. The 12 signs sit in FIXED cells
 * of a 4×4 grid (perimeter); the centre stays empty. Planets are drawn in the
 * cell of their sign, and the Ascendant's sign is highlighted ("La" = Lagna).
 * Colours use the theme CSS variables via `style` (var() needs CSS context).
 */

// sign index (0=Aries … 11=Pisces) → [row, col] in the 4×4 grid.
const CELL: Record<number, [number, number]> = {
  11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3],
  10: [1, 0], /* centre */          3: [1, 3],
  9: [2, 0], /*  centre */          4: [2, 3],
  8: [3, 0], 7: [3, 1], 6: [3, 2], 5: [3, 3],
}
const SIGN_ABBR = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi']
const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
}

function KundliChart({
  data, lagnaSign, signFor = (p) => p.sign, title = 'Rasi · D1', subtitle,
}: { data: BirthChartData; lagnaSign?: number; signFor?: (p: PlanetPosition) => number; title?: string; subtitle?: string }) {
  const S = 90
  const W = S * 4
  const ascSign = lagnaSign ?? data.ascendant.sign

  const bySign: Record<number, string[]> = {}
  for (const p of data.planets) {
    (bySign[signFor(p)] ||= []).push(PLANET_ABBR[p.name] ?? p.name.slice(0, 2))
  }
  const retro = new Set(data.planets.filter((p) => p.retrograde).map((p) => PLANET_ABBR[p.name] ?? p.name.slice(0, 2)))

  return (
    <svg viewBox={`0 0 ${W} ${W}`} className="mx-auto w-full max-w-md" role="img" aria-label="Rasi (D1) chart">
      <rect x={0.5} y={0.5} width={W - 1} height={W - 1} fill="none" style={{ stroke: 'rgb(var(--fg) / 0.35)' }} strokeWidth={1.5} />
      {Object.entries(CELL).map(([signStr, [r, c]]) => {
        const sign = Number(signStr)
        const x = c * S
        const y = r * S
        const isAsc = sign === ascSign
        return (
          <g key={sign}>
            <rect
              x={x} y={y} width={S} height={S}
              style={{ fill: isAsc ? 'rgb(var(--accent) / 0.12)' : 'transparent', stroke: 'rgb(var(--fg) / 0.22)' }}
              strokeWidth={1}
            />
            <text x={x + 6} y={y + 15} fontSize="11" fontFamily="monospace" style={{ fill: 'rgb(var(--muted))' }}>{SIGN_ABBR[sign]}</text>
            {isAsc && (
              <text x={x + S - 6} y={y + 15} fontSize="10" textAnchor="end" fontFamily="monospace" style={{ fill: 'rgb(var(--accent))' }}>La</text>
            )}
            {(bySign[sign] ?? []).map((ab, i) => (
              <text key={i} x={x + S / 2} y={y + 38 + i * 16} fontSize="14" textAnchor="middle" fontWeight={600}
                style={{ fill: retro.has(ab) ? 'rgb(var(--jade))' : 'rgb(var(--fg))' }}>
                {ab}{retro.has(ab) ? '℞' : ''}
              </text>
            ))}
          </g>
        )
      })}
      <text x={W / 2} y={W / 2 - 4} fontSize="12" textAnchor="middle" fontFamily="monospace" style={{ fill: 'rgb(var(--muted))' }}>{title}</text>
      <text x={W / 2} y={W / 2 + 14} fontSize="10" textAnchor="middle" fontFamily="monospace" style={{ fill: 'rgb(var(--muted))' }}>{subtitle ?? `Lagna: ${data.ascendant.signName}`}</text>
    </svg>
  )
}

export default memo(KundliChart)
