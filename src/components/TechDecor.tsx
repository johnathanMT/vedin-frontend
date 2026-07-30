import type { CSSProperties } from 'react'

/**
 * TechDecor — abstract, high-tech wireframe decorations pinned to the screen
 * edges (Azure-landing-page style). Reflects a CS / Software-Engineering / AI
 * identity: data-node cubes, a neural-network graph, and a perspective data grid.
 *
 * Design rules honoured:
 *  • Sits BEHIND content (fixed layer at z-[1]; site content is z-10).
 *  • pointer-events-none — never blocks clicks.
 *  • Low opacity + jade/maroon edge-lit glow → sheer & holographic, not distracting.
 *  • hidden md:block — completely hidden on phones; scales up on large screens.
 *
 * Colours pull from the theme tokens so they track the palette automatically:
 *   jade  = rgb(var(--jade))   ·   maroon = rgb(var(--accent))
 */

const JADE = 'rgb(var(--jade))'
const MAROON = 'rgb(var(--accent-light))'

const glow = (c: string, px = 6): CSSProperties => ({ filter: `drop-shadow(0 0 ${px}px ${c})` })

/* ── Design 1: isometric wireframe cube / tesseract (data node / server) ── */
function WireCube({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke={color} strokeWidth="1.1"
      strokeLinejoin="round" style={glow(color, 7)} aria-hidden="true">
      {/* outer isometric silhouette (hexagon) */}
      <path d="M100 16 L172 58 L172 142 L100 184 L28 142 L28 58 Z" opacity="0.55" />
      {/* the three front edges meeting at the centre vertex */}
      <path d="M100 100 L100 16 M100 100 L28 142 M100 100 L172 142" opacity="0.7" />
      {/* inner nested tesseract */}
      <path d="M100 58 L143 82 L143 124 L100 148 L57 124 L57 82 Z" opacity="0.32" />
      <path d="M100 100 L100 58 M100 100 L57 124 M100 100 L143 124" opacity="0.32" />
      {/* node dots */}
      <circle cx="100" cy="16" r="3" fill={color} />
      <circle cx="172" cy="58" r="3" fill={color} />
      <circle cx="28" cy="142" r="3" fill={color} />
      <circle cx="100" cy="184" r="2.5" fill={color} />
    </svg>
  )
}

/* ── Design 2: neural-network node graph (AI) ── */
function NeuralNet({ color }: { color: string }) {
  const nodes: number[][] = [
    [20, 40], [20, 110], [20, 180],          // input layer
    [110, 25], [110, 80], [110, 135], [110, 190], // hidden layer
    [200, 70], [200, 145],                   // output layer
  ]
  const edges: number[][] = [
    [0, 3], [0, 4], [0, 5], [1, 4], [1, 5], [1, 6], [2, 5], [2, 6],
    [3, 7], [4, 7], [4, 8], [5, 7], [5, 8], [6, 8],
  ]
  return (
    <svg viewBox="0 0 220 220" fill="none" style={glow(color, 6)} aria-hidden="true">
      <g stroke={color} strokeWidth="0.9" opacity="0.45">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
        ))}
      </g>
      <g fill={color}>
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.4" opacity="0.85" />
        ))}
      </g>
    </svg>
  )
}

/* ── Design 3: digital perspective grid + floating binary (data plane) ── */
function PerspectiveGrid({ color }: { color: string }) {
  // converging "floor" lines toward a vanishing point + horizontal scan rows
  const vp = [130, 30]
  const baseX = [0, 36, 78, 130, 182, 224, 260]
  return (
    <svg viewBox="0 0 260 220" fill="none" stroke={color} strokeWidth="0.9"
      style={glow(color, 6)} aria-hidden="true">
      <g opacity="0.4">
        {baseX.map((x, i) => <line key={i} x1={x} y1="220" x2={vp[0]} y2={vp[1]} />)}
      </g>
      <g opacity="0.3">
        {[210, 188, 160, 126, 86].map((y, i) => <line key={i} x1="6" y1={y} x2="254" y2={y} />)}
      </g>
      <g fill={color} opacity="0.55" style={{ font: '700 9px "Fira Code", monospace' }} stroke="none">
        <text x="186" y="150">1011</text>
        <text x="150" y="178">0110</text>
        <text x="120" y="120">10</text>
      </g>
    </svg>
  )
}

export default function TechDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden md:block" aria-hidden="true">
      {/* top-left — data-node cube */}
      <div className="absolute -left-6 top-24 w-40 opacity-20 lg:w-56" style={{ color: JADE }}>
        <WireCube color={JADE} />
      </div>

      {/* middle-right — perspective data grid */}
      <div className="absolute right-0 top-1/2 w-52 -translate-y-1/2 opacity-[0.16] lg:w-72" style={{ color: MAROON }}>
        <PerspectiveGrid color={MAROON} />
      </div>

      {/* bottom-right — neural network (AI) */}
      <div className="absolute -right-4 bottom-16 w-44 opacity-20 lg:w-60" style={{ color: JADE }}>
        <NeuralNet color={JADE} />
      </div>

      {/* bottom-left — small maroon cube echo */}
      <div className="absolute bottom-24 left-4 hidden w-32 opacity-[0.14] xl:block" style={{ color: MAROON }}>
        <WireCube color={MAROON} />
      </div>
    </div>
  )
}
