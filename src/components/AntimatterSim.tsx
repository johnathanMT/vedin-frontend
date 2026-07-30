import { useEffect, useRef } from 'react'
import { Zap } from 'lucide-react'

/**
 * AntimatterSim — a canvas particle sim: matter (e⁻, jade) and antimatter
 * (e⁺, maroon) drift through a field; when a particle meets its anti-partner they
 * ANNIHILATE into an expanding photon flash (γ, gold). Click to inject a burst.
 *
 * Performance: capped particle counts, devicePixelRatio-aware, and the rAF loop
 * is PAUSED whenever the section is off-screen (IntersectionObserver) to save
 * battery. Everything is cleaned up on unmount.
 */
interface Particle { anti: boolean; x: number; y: number; vx: number; vy: number; r: number; life: number }
interface Flash { x: number; y: number; r: number; max: number; a: number; vx?: number; vy?: number; spark?: boolean }

export default function AntimatterSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false

    let W = 0, H = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      W = wrap.clientWidth; H = wrap.clientHeight
      canvas.width = W * dpr; canvas.height = H * dpr
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(wrap)

    const JADE = '38,200,132', MAROON = '214,72,90', GOLD = '212,175,55'
    const MAX = window.innerWidth < 640 ? 26 : 46
    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    const particles: Particle[] = []
    const flashes: Flash[] = []
    const spawn = (anti: boolean, x?: number, y?: number) => particles.push({
      anti, x: x ?? rand(0, W), y: y ?? rand(0, H),
      vx: rand(-0.5, 0.5), vy: rand(-0.5, 0.5), r: rand(2.2, 3.6), life: rand(600, 1400),
    })
    for (let i = 0; i < MAX / 2; i++) { spawn(false); spawn(true) }

    const annihilate = (x: number, y: number) => {
      flashes.push({ x, y, r: 2, max: rand(26, 46), a: 1 })
      // a few photon sparks
      for (let k = 0; k < 6; k++) flashes.push({ x, y, r: 1, max: rand(8, 16), a: 0.8, vx: rand(-2, 2), vy: rand(-2, 2), spark: true })
    }

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left, y = e.clientY - rect.top
      spawn(false, x + rand(-6, 6), y + rand(-6, 6)); spawn(true, x + rand(-6, 6), y + rand(-6, 6))
    }
    canvas.addEventListener('click', onClick)

    let raf: number | null = null, running = false, last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(40, now - last); last = now
      ctx.clearRect(0, 0, W, H)

      // particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx; p.y += p.vy; p.life -= dt
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        const col = p.anti ? MAROON : JADE
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${col},0.9)`; ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${col},0.9)`; ctx.fill()
        ctx.shadowBlur = 0
        if (p.life <= 0) particles.splice(i, 1)
      }
      // collisions → annihilation
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          if (a.anti === b.anti) continue
          const dx = a.x - b.x, dy = a.y - b.y
          if (dx * dx + dy * dy < (a.r + b.r + 2) ** 2) {
            annihilate((a.x + b.x) / 2, (a.y + b.y) / 2)
            particles.splice(j, 1); particles.splice(i, 1); i--; break
          }
        }
      }
      // flashes (photons)
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i]
        f.r += f.spark ? 0.6 : 1.8; f.a -= 0.03
        if (f.spark) { f.x += f.vx ?? 0; f.y += f.vy ?? 0 }
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${GOLD},${Math.max(0, f.a)})`; ctx.lineWidth = f.spark ? 1 : 2
        ctx.shadowBlur = 14; ctx.shadowColor = `rgba(${GOLD},0.8)`; ctx.stroke(); ctx.shadowBlur = 0
        if (f.a <= 0 || f.r > f.max) flashes.splice(i, 1)
      }
      // keep the population topped up
      while (particles.length < MAX) spawn(Math.random() < 0.5)

      raf = requestAnimationFrame(tick)
    }

    const start = () => { if (!running && !reduce) { running = true; last = performance.now(); raf = requestAnimationFrame(tick) } }
    const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = null }

    // pause when off-screen
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else stop() }, { threshold: 0.05 })
    io.observe(wrap)
    if (reduce) { // static frame for reduced-motion users
      ctx.clearRect(0, 0, W, H)
      particles.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${p.anti ? MAROON : JADE},0.8)`; ctx.fill() })
    }

    return () => { stop(); io.disconnect(); ro.disconnect(); canvas.removeEventListener('click', onClick) }
  }, [])

  return (
    <section id="antimatter" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-jade">// ANTIMATTER</p>
        <h2 className="mt-4 flex items-center gap-3 text-3xl font-bold text-white sm:text-4xl">
          <Zap className="text-accent-light" size={30} /> Matter meets <span className="text-accent-light">antimatter</span>
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-gray-400">
          When an electron (e⁻) meets a positron (e⁺), both vanish — their mass converts to pure energy as two photons:
          <span className="ml-1 font-mono text-jade-light">e⁻ + e⁺ → γ + γ</span>. Tap the field to inject a pair.
        </p>

        <div ref={wrapRef} className="relative mt-8 h-[340px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#070809] sm:h-[420px]">
          <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair" />
          {/* legend */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-3 font-mono text-[10px] text-gray-400">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: 'rgb(38,200,132)' }} /> e⁻ matter</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: 'rgb(214,72,90)' }} /> e⁺ antimatter</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: '#d4af37' }} /> γ photon</span>
          </div>
        </div>
      </div>
    </section>
  )
}
