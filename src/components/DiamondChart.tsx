import { memo } from 'react'
import type { BirthChartData, PlanetPosition } from '../types/astrology'

/**
 * DiamondChart — North-Indian style chart (encyclopedia look). The 12 HOUSES are
 * fixed diamond regions (House 1 top-centre); the sign occupying each house and
 * its planets are drawn inside. Works for D1/D9/D10/D7 via `signFor` + `lagnaSign`.
 * Theme-aware (CSS vars); dignity is colour-coded (natal D1 dignity).
 */
const PLANET_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
}
const SIGN_ABBR = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi']

// house (1–12) → sign-number anchor (nx,ny) + planet-stack start (px,py). viewBox 320².
const H: Record<number, { nx: number; ny: number; px: number; py: number }> = {
  1: { nx: 160, ny: 52, px: 160, py: 70 }, 2: { nx: 84, ny: 26, px: 84, py: 46 },
  3: { nx: 40, ny: 80, px: 40, py: 98 }, 4: { nx: 82, ny: 150, px: 82, py: 168 },
  5: { nx: 40, ny: 236, px: 40, py: 214 }, 6: { nx: 84, ny: 286, px: 84, py: 268 },
  7: { nx: 160, ny: 226, px: 160, py: 244 }, 8: { nx: 236, ny: 286, px: 236, py: 268 },
  9: { nx: 280, ny: 236, px: 280, py: 214 }, 10: { nx: 238, ny: 150, px: 238, py: 168 },
  11: { nx: 280, ny: 80, px: 280, py: 98 }, 12: { nx: 236, ny: 26, px: 236, py: 46 },
}

const dignityColor = (d: string): string =>
  d === 'Exalted' ? 'rgb(var(--jade))'
    : d === 'Debilitated' ? 'rgb(var(--coral))'
      : d === 'Own' ? 'rgb(var(--accent))'
        : 'rgb(var(--fg))'

function DiamondChart({
  data, lagnaSign, signFor = (p) => p.sign, title = 'Rasi · D1', subtitle,
}: { data: BirthChartData; lagnaSign?: number; signFor?: (p: PlanetPosition) => number; title?: string; subtitle?: string }) {
  const ascSign = lagnaSign ?? data.ascendant.sign

  // Group planets by HOUSE in this chart.
  const byHouse: Record<number, PlanetPosition[]> = {}
  for (const p of data.planets) {
    const house = ((signFor(p) - ascSign + 12) % 12) + 1
    ;(byHouse[house] ||= []).push(p)
  }

  const line = { stroke: 'rgb(var(--accent) / 0.55)', strokeWidth: 1 }
  const cap = subtitle ? `${title} · ${subtitle}` : title

  return (
    <svg viewBox="0 0 320 344" className="mx-auto w-full max-w-md" role="img" aria-label={title}>
      {/* board */}
      <rect x={1} y={1} width={318} height={318} fill="rgb(var(--card))" style={{ stroke: 'rgb(var(--accent) / 0.7)' }} strokeWidth={1.6} />
      <line x1={1} y1={1} x2={319} y2={319} style={line} />
      <line x1={319} y1={1} x2={1} y2={319} style={line} />
      <path d="M160 1 L319 160 L160 319 L1 160 Z" fill="none" style={line} />

      {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
        const a = H[house]
        const sign = (ascSign + house - 1) % 12
        const isAsc = house === 1
        return (
          <g key={house}>
            <text x={a.nx} y={a.ny} textAnchor="middle" fontSize={10} fontFamily="monospace"
              style={{ fill: isAsc ? 'rgb(var(--accent))' : 'rgb(var(--muted))' }}>
              {SIGN_ABBR[sign]}{isAsc ? ' ·La' : ''}
            </text>
            {(byHouse[house] ?? []).map((p, i) => (
              <text key={p.name} x={a.px} y={a.py + i * 15} textAnchor="middle" fontSize={12.5} fontWeight={600}
                fontFamily="monospace" style={{ fill: dignityColor(p.dignity) }}>
                {PLANET_ABBR[p.name] ?? p.name.slice(0, 2)}{p.retrograde ? '℞' : ''}
              </text>
            ))}
          </g>
        )
      })}

      <text x={160} y={336} textAnchor="middle" fontSize={11} fontFamily="monospace" style={{ fill: 'rgb(var(--muted))' }}>{cap}</text>
    </svg>
  )
}

export default memo(DiamondChart)
