import { useEffect, useRef, useState } from 'react'
import { Brain, Wrench, Eye, Sparkles, CheckCircle2, Play, Pause, RotateCcw, type LucideIcon } from 'lucide-react'
import { useInView } from '../hooks/useInView'

/**
 * AgentFlow — an animated agentic-AI reasoning loop:
 *   Plan → Call Tool → Observe → Reflect → (loop) → Answer
 * A pulse travels node-to-node, the active node glows, and a terminal log types
 * out each step. Auto-runs; can be paused / restarted. Pure React + timers.
 */

interface FlowNode { id: string; label: string; Icon: LucideIcon; color: string }
const NODES: FlowNode[] = [
  { id: 'plan', label: 'Plan', Icon: Brain, color: 'rgb(var(--jade))' },
  { id: 'tool', label: 'Call Tool', Icon: Wrench, color: 'rgb(var(--accent-light))' },
  { id: 'observe', label: 'Observe', Icon: Eye, color: '#d4af37' },
  { id: 'reflect', label: 'Reflect', Icon: Sparkles, color: 'rgb(var(--jade-light))' },
]

interface ScriptStep { node: number; log: string }
// One scripted run of the loop (2 iterations, then Answer).
const SCRIPT: ScriptStep[] = [
  { node: 0, log: '🧠 plan: break "compare GPUs for training" into sub-tasks' },
  { node: 1, log: '🔧 tool: web_search("RTX 4090 vs A100 throughput")' },
  { node: 2, log: '👁 observe: 5 sources · 2 benchmarks parsed' },
  { node: 3, log: '✨ reflect: missing price/availability → loop again' },
  { node: 0, log: '🧠 plan: fetch current cloud pricing' },
  { node: 1, log: '🔧 tool: get_pricing("A100", region="asia")' },
  { node: 2, log: '👁 observe: $1.10/hr spot · in-stock' },
  { node: 3, log: '✨ reflect: enough evidence → finalize' },
  { node: -1, log: '✅ answer: A100 wins for large models; 4090 best $/throughput for solo dev' },
]

export default function AgentFlow() {
  const [step, setStep] = useState(-1)
  const [logs, setLogs] = useState<string[]>([])
  const [playing, setPlaying] = useState(true)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [viewRef, inView] = useInView({ threshold: 0.15 })

  useEffect(() => {
    if (!playing || !inView) return   // pause the loop while off-screen
    timer.current = setTimeout(() => {
      setStep((s) => {
        const next = s + 1
        if (next >= SCRIPT.length) { setLogs([]); return -1 } // loop the demo
        setLogs((l) => [...l.slice(-6), SCRIPT[next].log])
        return next
      })
    }, step === -1 ? 700 : 1300)
    return () => clearTimeout(timer.current)
  }, [step, playing, inView])

  const restart = () => { clearTimeout(timer.current); setStep(-1); setLogs([]); setPlaying(true) }
  const activeNode = step >= 0 && step < SCRIPT.length ? SCRIPT[step].node : null
  const answering = step >= 0 && SCRIPT[step].node === -1

  return (
    <section id="agent" ref={viewRef} className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-jade">// AGENTIC AI</p>
        <h2 className="mt-4 flex items-center gap-3 text-3xl font-bold text-white sm:text-4xl">
          <Brain className="text-accent-light" size={30} /> How an <span className="text-accent-light">AI agent</span> thinks
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-gray-400">
          Not a single prompt — a loop. The agent plans, calls tools, observes results, and reflects until it has enough
          to answer. Watch one run unfold.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <button onClick={() => setPlaying((p) => !p)} className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-xs text-accent-light transition hover:bg-accent/20">
            {playing ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
          </button>
          <button onClick={restart} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-xs text-gray-300 transition hover:bg-white/10">
            <RotateCcw size={13} /> Restart
          </button>
        </div>

        {/* node loop */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:gap-3">
          {NODES.map((n, i) => {
            const active = activeNode === i
            return (
              <div key={n.id} className="flex items-center gap-2 sm:gap-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300 sm:h-20 sm:w-20"
                    style={{ borderColor: active ? n.color : 'rgb(255 255 255 / 0.10)', background: active ? `color-mix(in srgb, ${n.color} 16%, transparent)` : 'rgb(255 255 255 / 0.02)', boxShadow: active ? `0 0 24px color-mix(in srgb, ${n.color} 55%, transparent)` : 'none', transform: active ? 'translateY(-3px)' : 'none' }}>
                    <n.Icon size={26} style={{ color: active ? n.color : '#6b7280' }} />
                  </div>
                  <span className="font-mono text-[11px]" style={{ color: active ? n.color : '#6b7280' }}>{n.label}</span>
                </div>
                {i < NODES.length - 1 && (
                  <span className="text-lg" style={{ color: activeNode === i ? n.color : '#374151' }}>→</span>
                )}
              </div>
            )
          })}
          {/* loop-back / answer */}
          <span className="mx-1 font-mono text-xs text-gray-600">⟳</span>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-300 sm:h-20 sm:w-20"
              style={{ borderColor: answering ? '#d4af37' : 'rgb(255 255 255 / 0.10)', background: answering ? 'color-mix(in srgb, #d4af37 16%, transparent)' : 'rgb(255 255 255 / 0.02)', boxShadow: answering ? '0 0 24px rgba(212,175,55,0.55)' : 'none' }}>
              <CheckCircle2 size={26} style={{ color: answering ? '#d4af37' : '#6b7280' }} />
            </div>
            <span className="font-mono text-[11px]" style={{ color: answering ? '#d4af37' : '#6b7280' }}>Answer</span>
          </div>
        </div>

        {/* terminal log */}
        <div className="mt-6 h-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0c] p-4 font-mono text-[12px] leading-relaxed">
          <div className="mb-2 flex items-center gap-1.5 text-gray-500">
            <span className="h-2 w-2 rounded-full bg-[#ff5f56]" /><span className="h-2 w-2 rounded-full bg-[#ffbd2e]" /><span className="h-2 w-2 rounded-full bg-[#27c93f]" />
            <span className="ml-2 text-[10px] uppercase tracking-wider">agent.log</span>
          </div>
          {logs.length === 0 ? <div className="text-gray-600">› initializing agent…</div> : logs.map((l, i) => (
            <div key={i} className={i === logs.length - 1 ? 'text-jade-light' : 'text-gray-400'}>› {l}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
