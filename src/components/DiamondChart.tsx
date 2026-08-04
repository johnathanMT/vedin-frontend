import { memo } from 'react'
import type { CSSProperties } from 'react'
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
const SIGN_FULL = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

// What each house signifies — surfaced on hover so the chart teaches itself.
const HOUSE_MEANING: Record<number, string> = {
  1: 'Self, body, vitality', 2: 'Wealth, speech, family', 3: 'Courage, siblings, effort',
  4: 'Home, mother, comfort', 5: 'Children, intellect, purva punya', 6: 'Debt, disease, enemies',
  7: 'Marriage, partnership', 8: 'Longevity, upheaval, the occult', 9: 'Fortune, dharma, father',
  10: 'Career, status, action', 11: 'Gains, networks, fulfilment', 12: 'Loss, seclusion, moksha',
}

// house (1–12) → sign-number anchor (nx,ny) + planet-stack start (px,py). viewBox 320².
const H: Record<number, { nx: number; ny: number; px: number; py: number }> = {
  1: { nx: 160, ny: 52, px: 160, py: 70 }, 2: { nx: 84, ny: 26, px: 84, py: 46 },
  3: { nx: 40, ny: 80, px: 40, py: 98 }, 4: { nx: 82, ny: 150, px: 82, py: 168 },
  5: { nx: 40, ny: 236, px: 40, py: 214 }, 6: { nx: 84, ny: 286, px: 84, py: 268 },
  7: { nx: 160, ny: 226, px: 160, py: 244 }, 8: { nx: 236, ny: 286, px: 236, py: 268 },
  9: { nx: 280, ny: 236, px: 280, py: 214 }, 10: { nx: 238, ny: 150, px: 238, py: 168 },
  11: { nx: 280, ny: 80, px: 280, py: 98 }, 12: { nx: 236, ny: 26, px: 236, py: 46 },
}

// Clickable/hoverable region per house — a diamond or triangle matching the board.
const HOUSE_PATH: Record<number, string> = {
  1: 'M160 1 L239 80 L160 160 L81 80 Z', 2: 'M1 1 L160 1 L81 80 Z',
  3: 'M1 1 L81 80 L1 160 Z', 4: 'M1 160 L81 80 L160 160 L81 240 Z',
  5: 'M1 160 L81 240 L1 319 Z', 6: 'M1 319 L81 240 L160 319 Z',
  7: 'M160 160 L239 240 L160 319 L81 240 Z', 8: 'M160 319 L239 240 L319 319 Z',
  9: 'M319 319 L239 240 L319 160 Z', 10: 'M319 160 L239 240 L160 160 L239 80 Z',
  11: 'M319 160 L239 80 L319 1 Z', 12: 'M319 1 L239 80 L160 1 Z',
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
  const d = (s: number) => ({ '--d': `${s}s` } as CSSProperties)

  return (
    <svg viewBox="0 0 320 344" className="mx-auto w-full max-w-md" role="img" aria-label={title}>
      {/* board */}
      <rect x={1} y={1} width={318} height={318} fill="rgb(var(--card))" style={{ stroke: 'rgb(var(--accent) / 0.7)' }} strokeWidth={1.6} />
      <line x1={1} y1={1} x2={319} y2={319} style={line} className="chart-stroke" />
      <line x1={319} y1={1} x2={1} y2={319} style={line} className="chart-stroke" />
      <path d="M160 1 L319 160 L160 319 L1 160 Z" fill="none" style={{ ...line, ...d(0.18) }} className="chart-stroke" />

      {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
        const a = H[house]
        const sign = (ascSign + house - 1) % 12
        const isAsc = house === 1
        const planets = byHouse[house] ?? []
        const tip = [
          `House ${house} · ${SIGN_FULL[sign]}${isAsc ? ' (Lagna)' : ''}`,
          HOUSE_MEANING[house],
          planets.length
            ? planets.map((p) => `${p.name}${p.retrograde ? ' ℞' : ''}${p.dignity && p.dignity !== 'Neutral' ? ` — ${p.dignity}` : ''}`).join('\n')
            : 'No planets',
        ].join('\n')

        return (
          <g key={house}>
            {/* transparent hit area carrying the native tooltip */}
            <path d={HOUSE_PATH[house]} fill="transparent" className="cursor-help">
              <title>{tip}</title>
            </path>
            <text x={a.nx} y={a.ny} textAnchor="middle" fontSize={10} fontFamily="monospace"
              className="pointer-events-none chart-glyph" style={{ fill: isAsc ? 'rgb(var(--accent))' : 'rgb(var(--muted))', ...d(0.3 + house * 0.02) }}>
              {SIGN_ABBR[sign]}{isAsc ? ' ·La' : ''}
            </text>
            {planets.map((p, i) => (
              <text key={p.name} x={a.px} y={a.py + i * 15} textAnchor="middle" fontSize={12.5} fontWeight={600}
                fontFamily="monospace" className="pointer-events-none chart-glyph"
                style={{ fill: dignityColor(p.dignity), ...d(0.45 + house * 0.03 + i * 0.04) }}>
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
