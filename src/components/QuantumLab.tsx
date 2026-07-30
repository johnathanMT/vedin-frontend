import { useMemo, useState } from 'react'
import { Atom, RotateCcw } from 'lucide-react'

/**
 * QuantumLab — a real 2-qubit quantum circuit simulator. Place H / X / Z gates
 * per qubit per column, add CNOTs, and watch the state vector + measurement
 * probabilities update live. Pure complex-number maths, no libraries.
 *
 * State = 4 complex amplitudes for basis |00>, |01>, |10>, |11>.
 * (bit order: q0 = most-significant, q1 = least-significant)
 */

// ── minimal complex helpers ──
interface Complex { re: number; im: number }
const c = (re: number, im = 0): Complex => ({ re, im })
const cadd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im })
const cmul = (a: Complex, b: Complex): Complex => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re })
const cabs2 = (a: Complex): number => a.re * a.re + a.im * a.im
const INV_SQRT2 = 1 / Math.SQRT2

type GateName = 'I' | 'H' | 'X' | 'Z'
type Gate = Complex[][] | null

// single-qubit gates (2×2 complex)
const GATES: Record<GateName, Gate> = {
  I: null,
  H: [[c(INV_SQRT2), c(INV_SQRT2)], [c(INV_SQRT2), c(-INV_SQRT2)]],
  X: [[c(0), c(1)], [c(1), c(0)]],
  Z: [[c(1), c(0)], [c(0), c(-1)]],
}
const GATE_CYCLE: GateName[] = ['I', 'H', 'X', 'Z']

const COLS = 5
const QUBITS = 2

// apply a 2×2 gate to qubit q of a 4-amplitude state
function applyGate(state: Complex[], G: Gate, q: number): Complex[] {
  if (!G) return state
  const out = state.map(() => c(0))
  for (let i = 0; i < 4; i++) {
    const bit = (i >> (QUBITS - 1 - q)) & 1
    const partner = i ^ (1 << (QUBITS - 1 - q))
    const row = bit
    // out[i] += G[row][0]*state[bit=0 index] + G[row][1]*state[bit=1 index]
    const i0 = bit === 0 ? i : partner
    const i1 = bit === 0 ? partner : i
    out[i] = cadd(cmul(G[row][0], state[i0]), cmul(G[row][1], state[i1]))
  }
  return out
}

// CNOT: control q0, target q1 → flip target when control bit = 1
function applyCNOT(state: Complex[]): Complex[] {
  const out = state.slice()
  // basis indices: 0:00 1:01 2:10 3:11 ; control=q0 (high bit), target=q1 (low bit)
  // swap |10> (2) and |11> (3)
  const t = out[2]; out[2] = out[3]; out[3] = t
  return out
}

function simulate(grid: GateName[][], cnots: boolean[]): Complex[] {
  let state: Complex[] = [c(1), c(0), c(0), c(0)]   // |00>
  for (let col = 0; col < COLS; col++) {
    for (let q = 0; q < QUBITS; q++) state = applyGate(state, GATES[grid[q][col]], q)
    if (cnots[col]) state = applyCNOT(state)
  }
  return state
}

const BASIS = ['00', '01', '10', '11']

const emptyGrid = (): GateName[][] => Array.from({ length: QUBITS }, () => Array.from({ length: COLS }, (): GateName => 'I'))
const emptyCnots = (): boolean[] => Array.from({ length: COLS }, () => false)

export default function QuantumLab() {
  const [grid, setGrid] = useState<GateName[][]>(emptyGrid)
  const [cnots, setCnots] = useState<boolean[]>(emptyCnots)

  const state = useMemo(() => simulate(grid, cnots), [grid, cnots])
  const probs = state.map(cabs2)
  const entangled = useMemo(() => {
    // product state ⇔ p00*p11 ≈ p01*p10  (for real demo purposes)
    const [p00, p01, p10, p11] = probs
    return Math.abs(p00 * p11 - p01 * p10) > 0.02
  }, [probs])

  const cycle = (q: number, col: number) => setGrid((g) => {
    const ng = g.map((r) => r.slice())
    ng[q][col] = GATE_CYCLE[(GATE_CYCLE.indexOf(ng[q][col]) + 1) % GATE_CYCLE.length]
    return ng
  })
  const reset = () => { setGrid(emptyGrid()); setCnots(emptyCnots()) }
  const preset = (name: 'bell' | 'super' | 'flip') => {
    const g = emptyGrid()
    const cn = emptyCnots()
    if (name === 'bell') { g[0][0] = 'H'; cn[1] = true }            // Bell pair (entangled)
    if (name === 'super') { g[0][0] = 'H'; g[1][0] = 'H' }          // uniform superposition
    if (name === 'flip') { g[0][0] = 'X'; g[1][0] = 'X' }           // |11>
    setGrid(g); setCnots(cn)
  }

  const gateColor = (gt: string): string => gt === 'H' ? 'rgb(var(--jade))' : gt === 'X' ? 'rgb(var(--accent-light))' : gt === 'Z' ? '#d4af37' : 'transparent'

  return (
    <section id="quantum" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-jade">// QUANTUM LAB</p>
        <h2 className="mt-4 flex items-center gap-3 text-3xl font-bold text-white sm:text-4xl">
          <Atom className="text-accent-light" size={30} /> A real <span className="text-accent-light">2-qubit</span> circuit
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-gray-400">
          Tap a cell to cycle gates (H · X · Z), toggle a CNOT, and watch the quantum state collapse into measurement
          probabilities — computed live with complex amplitudes.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ── circuit ── */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              <button onClick={() => preset('bell')} className="rounded-lg border border-jade/30 bg-jade/10 px-3 py-1.5 font-mono text-[11px] text-jade-light transition hover:bg-jade/20">Bell pair</button>
              <button onClick={() => preset('super')} className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-gray-300 transition hover:bg-white/10">Superposition</button>
              <button onClick={() => preset('flip')} className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-gray-300 transition hover:bg-white/10">Flip → |11⟩</button>
              <button onClick={reset} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-gray-300 transition hover:bg-white/10"><RotateCcw size={12} /> Reset</button>
            </div>

            {[0, 1].map((q) => (
              <div key={q} className="mb-2 flex items-center gap-2">
                <span className="w-10 shrink-0 font-mono text-xs text-jade">q{q}</span>
                <div className="relative flex flex-1 items-center">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
                  <div className="relative flex w-full justify-between">
                    {Array.from({ length: COLS }, (_, col) => {
                      const gt = grid[q][col]
                      return (
                        <button key={col} onClick={() => cycle(q, col)}
                          className="flex h-9 w-9 items-center justify-center rounded-md border font-mono text-sm font-bold transition"
                          style={{ borderColor: gt === 'I' ? 'rgb(255 255 255 / 0.12)' : gateColor(gt), background: gt === 'I' ? 'rgb(255 255 255 / 0.03)' : `color-mix(in srgb, ${gateColor(gt)} 20%, transparent)`, color: gt === 'I' ? '#4b5563' : gateColor(gt), boxShadow: gt === 'I' ? 'none' : `0 0 10px color-mix(in srgb, ${gateColor(gt)} 40%, transparent)` }}>
                          {gt === 'I' ? '·' : gt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* CNOT row */}
            <div className="mt-2 flex items-center gap-2">
              <span className="w-10 shrink-0 font-mono text-[10px] text-gray-500">CNOT</span>
              <div className="flex flex-1 justify-between">
                {Array.from({ length: COLS }, (_, col) => (
                  <button key={col} onClick={() => setCnots((cn) => cn.map((v, i) => i === col ? !v : v))}
                    className="flex h-9 w-9 items-center justify-center rounded-md border font-mono text-xs transition"
                    style={{ borderColor: cnots[col] ? 'rgb(var(--accent-light))' : 'rgb(255 255 255 / 0.10)', background: cnots[col] ? 'color-mix(in srgb, rgb(var(--accent-light)) 18%, transparent)' : 'transparent', color: cnots[col] ? 'rgb(var(--accent-light))' : '#4b5563' }}>
                    ⊕
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 font-mono text-[10px] text-gray-500">CNOT: control q0 → target q1</p>
          </div>

          {/* ── measurement ── */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-gray-400">measurement probability</span>
              {entangled && <span className="rounded-full border border-jade/40 bg-jade/10 px-2 py-0.5 font-mono text-[10px] text-jade-light">entangled</span>}
            </div>
            <div className="space-y-3">
              {BASIS.map((b, i) => (
                <div key={b}>
                  <div className="mb-1 flex justify-between font-mono text-[11px]">
                    <span className="text-gray-300">|{b}⟩</span>
                    <span className="text-jade-light">{(probs[i] * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full transition-[width] duration-300"
                      style={{ width: `${probs[i] * 100}%`, background: 'linear-gradient(90deg, rgb(var(--accent)), rgb(var(--jade)))', boxShadow: probs[i] > 0.01 ? '0 0 10px rgb(var(--jade) / 0.5)' : 'none' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-gray-400">
              <span className="text-gray-500">|ψ⟩ =</span>{' '}
              {state.map((a, i) => {
                if (cabs2(a) < 1e-4) return null
                const amp = a.im === 0 ? a.re.toFixed(2) : `(${a.re.toFixed(2)}${a.im >= 0 ? '+' : ''}${a.im.toFixed(2)}i)`
                return <span key={i} className="text-jade-light">{i > 0 ? ' + ' : ''}{amp}|{BASIS[i]}⟩</span>
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
