import type { AreaReading } from '../lib/vedin'

/**
 * AreaRadar — spider/radar SVG chart of the life-area scores (0–100). One axis
 * per area, numbered 1..N (a legend maps numbers → labels beside the chart).
 * Theme-aware via CSS vars.
 */
export default function AreaRadar({ areas }: { areas: AreaReading[] }) {
  const N = areas.length
  if (N < 3) return null
  const cx = 130, cy = 130, R = 96
  const ang = (i: number) => ((-90 + (i * 360) / N) * Math.PI) / 180
  const pt = (i: number, r: number): [number, number] => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))]
  const ringPts = (f: number) => areas.map((_, i) => pt(i, R * f).join(',')).join(' ')
  const valuePts = areas.map((a, i) => pt(i, (R * Math.max(a.score, 5)) / 100).join(',')).join(' ')

  return (
    <svg viewBox="0 0 260 260" className="mx-auto w-full max-w-xs" role="img" aria-label="Life-area strengths">
      {[0.25, 0.5, 0.75, 1].map((f, k) => (
        <polygon key={k} points={ringPts(f)} fill="none" style={{ stroke: 'rgb(var(--fg) / 0.12)' }} strokeWidth={1} />
      ))}
      {areas.map((_, i) => {
        const [x, y] = pt(i, R)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} style={{ stroke: 'rgb(var(--fg) / 0.12)' }} strokeWidth={1} />
      })}
      <polygon points={valuePts} style={{ fill: 'rgb(var(--accent) / 0.22)', stroke: 'rgb(var(--accent))' }} strokeWidth={1.6} />
      {areas.map((a, i) => {
        const [x, y] = pt(i, (R * Math.max(a.score, 5)) / 100)
        return <circle key={i} cx={x} cy={y} r={2.6} style={{ fill: 'rgb(var(--accent))' }} />
      })}
      {areas.map((_, i) => {
        const [x, y] = pt(i, R + 15)
        return (
          <text key={i} x={x} y={y + 3.5} textAnchor="middle" fontSize={11} fontWeight={600} fontFamily="monospace" style={{ fill: 'rgb(var(--muted))' }}>
            {i + 1}
          </text>
        )
      })}
    </svg>
  )
}
