import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import '../crt.css'

/**
 * CRTHero — "Quantum / Future-tech" hero.
 * A glassmorphism workstation panel over a hex data-grid, with Framer-Motion
 * floating data nodes and a cyberpunk glitch + RGB-split + data-stream name.
 * Pure CSS/SVG + Framer Motion — no 3D libraries. Responsive & accessible.
 */
interface NodeData { x: string; y: string; s: number; c: string; d: number }

// Floating quantum "data nodes" (cyan / magenta / electric-blue)
const NODES: NodeData[] = [
  { x: '12%', y: '24%', s: 10, c: '#00e5ff', d: 0 },
  { x: '85%', y: '20%', s: 7, c: '#ff3df0', d: 0.6 },
  { x: '78%', y: '70%', s: 12, c: '#4b7bff', d: 1.1 },
  { x: '18%', y: '74%', s: 8, c: '#00e5ff', d: 0.3 },
  { x: '50%', y: '12%', s: 6, c: '#00e5ff', d: 0.9 },
  { x: '92%', y: '48%', s: 5, c: '#ff3df0', d: 1.4 },
  { x: '6%', y: '50%', s: 6, c: '#4b7bff', d: 0.5 },
]

function DataNode({ x, y, s, c, d }: NodeData) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute rounded-full"
      style={{ left: x, top: y, width: s, height: s, background: c, boxShadow: `0 0 12px ${c}, 0 0 24px ${c}` }}
      initial={{ opacity: 0.4, y: 0 }}
      animate={{ opacity: [0.4, 1, 0.4], y: [0, -14, 0] }}
      transition={{ duration: 4 + d, delay: d, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

// A faint rotating hexagon accent
function HexAccent({ className, size = 120, color = 'rgba(0,229,255,0.25)' }: { className?: string; size?: number; color?: string }) {
  return (
    <motion.svg
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      width={size} height={size} viewBox="0 0 100 100" fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
    >
      <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" stroke={color} strokeWidth="1" />
      <polygon points="50,20 78,36 78,64 50,80 22,64 22,36" stroke={color} strokeWidth="0.6" opacity="0.6" />
    </motion.svg>
  )
}

export default function CRTHero({ children }: { children?: ReactNode }) {
  return (
    <section id="home" className="q-stage">
      {/* backdrops */}
      <div className="q-grid" />
      <div className="q-sweep" />
      <HexAccent className="left-[6%] top-[14%]" size={150} />
      <HexAccent className="right-[8%] bottom-[12%]" size={110} color="rgba(255,61,240,0.22)" />

      {/* floating data nodes */}
      {NODES.map((n, i) => <DataNode key={i} {...n} />)}

      {/* glass workstation panel */}
      <motion.div
        className="q-panel"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" /> quantum workstation · online
        </p>

        {/* Single-line advanced cyber title — effects (dataflow gradient, CRT
            scanlines, RGB slice-glitch, glow) all live on .q-name in crt.css. */}
        <span className="q-name-wrap block">
          <h1 className="q-name" data-text="MYO THANT NAING">
            MYO THANT NAING
          </h1>
        </span>

        <p className="mx-auto mt-5 max-w-xl text-base text-gray-300 sm:text-lg">
          From <span className="text-cyan">Caring</span> to{' '}
          <span style={{ color: '#ff3df0' }}>Coding</span> in Japan 🇯🇵 — Computer Science Student, Caregiver,
          aspiring AI Engineer.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {['React', 'C# / .NET', 'AI', 'Computer Science', 'Web',].map((b) => (
            <span key={b} className="rounded-md border border-white/12 bg-white/[0.04] px-3 py-1 font-mono text-xs text-gray-300">
              {b}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#projects"
            onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="rounded-lg bg-gradient-to-r from-cyan to-[#4b7bff] px-6 py-2.5 text-sm font-semibold text-[#04121a] shadow-lg shadow-cyan/25 transition-transform hover:-translate-y-0.5">
            View My Work
          </a>
          <a href="#about"
            onClick={(e) => { e.preventDefault(); document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="rounded-lg border border-white/20 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:border-cyan hover:text-cyan">
            My Story
          </a>
        </div>

        {children}
      </motion.div>
    </section>
  )
}
