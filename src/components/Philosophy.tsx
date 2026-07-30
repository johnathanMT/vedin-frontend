import { useEffect, useRef, useState } from 'react'
import { PERSONAL } from '../data/content'

/* Matrix-style code rain drawn on a <canvas>, sized to its parent.
   Throttled to ~16fps and disabled for prefers-reduced-motion. */
function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const chars = 'アイウエオカキ0123456789ABCDEF<>[]{}()=+*/$#@'.split('')
    const fontSize = 14
    let w = 0, h = 0, raf = 0, last = 0
    let drops: number[] = []

    const resize = () => {
      w = canvas.width = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
      drops = Array(Math.ceil(w / fontSize)).fill(0).map(() => Math.random() * (h / fontSize))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (t - last < 60) return
      last = t
      ctx.fillStyle = 'rgba(20, 20, 20,0.22)'   // fade trail
      ctx.fillRect(0, 0, w, h)
      ctx.font = `${fontSize}px monospace`
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[(Math.random() * chars.length) | 0]
        const x = i * fontSize
        const y = drops[i] * fontSize
        ctx.fillStyle = Math.random() > 0.93 ? 'rgb(var(--accent))' : 'rgb(var(--accent)/0.6)'
        ctx.fillText(ch, x, y)
        if (y > h && Math.random() > 0.975) drops[i] = 0
        drops[i] += 1
      }
    }
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 h-full w-full pointer-events-none opacity-[0.16]" aria-hidden />
}

export default function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null)
  const [typed, setTyped] = useState('')
  const [done, setDone] = useState(false)
  const fullText = `print("${PERSONAL.quote}")`

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect()
          let i = 0
          const interval = setInterval(() => {
            setTyped(fullText.slice(0, i + 1))
            i++
            if (i >= fullText.length) { clearInterval(interval); setDone(true) }
          }, 32)
        }
      },
      { threshold: 0.35 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [fullText])

  return (
    <section ref={sectionRef} className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-space/40 via-transparent to-space/40 pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      {/* subtle deep-crimson undertone */}
      <div className="absolute left-1/2 bottom-8 -translate-x-1/2 w-[460px] h-[200px] rounded-full blur-3xl pointer-events-none opacity-[0.10]"
        style={{ background: 'radial-gradient(ellipse, rgb(var(--maroon)), transparent 70%)' }} />

      <div className="section-container relative z-10">
        {/* Larger, prominent terminal */}
        <div className="relative mx-auto max-w-4xl rounded-2xl overflow-hidden border border-accent/25"
          style={{ boxShadow: '0 0 50px -10px rgb(var(--accent)/0.5), 0 30px 80px -20px rgba(0,0,0,0.8)' }}>
          {/* Title bar */}
          <div className="flex items-center gap-2 px-5 py-3.5 bg-white/5 border-b border-white/10 backdrop-blur-md">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f57]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#febc2e]" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-sm text-gray-300 font-mono">philosophy.py</span>
            <span className="ml-auto text-[11px] font-mono text-accent-light/70 hidden sm:inline">~/mtn · python 3.12</span>
          </div>

          {/* Body */}
          <div className="dark-island relative bg-[#141414] p-7 md:p-12 font-mono text-base md:text-lg leading-relaxed min-h-[340px]">
            <MatrixRain />
            {/* scanline sheen */}
            <div className="term-scanlines absolute inset-0 pointer-events-none" aria-hidden />

            <div className="relative z-10">
              <p className="text-gray-400 mb-5 text-sm md:text-base">
                <span className="text-green-400">~/mtn</span>
                <span className="text-gray-500"> $ python3 philosophy.py</span>
              </p>

              {/* Typed line */}
              <p className="text-gray-100 mb-5 min-h-[1.6em] break-words">
                <span className="text-[#f97316]">print</span>
                <span className="text-white">(</span>
                <span className="text-[#9ae6b4]">"</span>
                <span className="text-[#9ae6b4]">
                  {typed.replace(/^print\("/, '').replace(/"?\)$/, '')}
                </span>
                {!done && <span className="term-cursor" />}
                {done && (<><span className="text-[#9ae6b4]">"</span><span className="text-white">)</span></>)}
              </p>

              {done && (
                <>
                  {/* Output quote */}
                  <div className="border-l-2 border-accent pl-5 my-7"
                    style={{ boxShadow: '-2px 0 16px -4px rgb(var(--accent)/0.7)' }}>
                    <p className="text-xl md:text-2xl font-sans font-bold text-white leading-snug">
                      "{PERSONAL.quote}"
                    </p>
                  </div>

                  {/* Author line */}
                  <p className="text-gray-500 text-sm md:text-base">
                    <span className="text-[#569cd6]">const</span>{' '}
                    <span className="text-[#9cdcfe]">author</span>{' '}
                    <span className="text-white">=</span>{' '}
                    <span className="text-[#ce9178]">"{PERSONAL.handle}"</span>
                    <span className="text-white">;</span>
                  </p>
                  <p className="text-gray-400 mt-4 text-sm md:text-base">
                    <span className="text-green-400">~/mtn</span>
                    <span className="text-gray-500"> $ </span>
                    <span className="term-cursor" />
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
