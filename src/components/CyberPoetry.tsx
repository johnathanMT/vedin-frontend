import { useEffect, useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import { SITE } from '../config/site'
import type { Poem, PoetryResponse } from '../types/api'

/**
 * CyberPoetry — an interactive "Holographic Grimoire": a dark, glowing flip-book
 * of techno-science poems. Poems are fetched LIVE from the public API
 * (GET /api/poetry → { poems }); if that's empty/unreachable we fall back to the
 * bundled defaults so the homepage section is never blank.
 *
 * The 3D page-turn is done with framer-motion (no extra library): each page
 * swings on its spine (rotateY) as you click the arrows or drag left/right.
 */
const API = `${SITE.apiUrl}/api/poetry`

// Fallback poems (original) — shown if the API has none yet or is offline.
const DEFAULT_POEMS: Poem[] = [
  { id: 'd1', title: '// run: becoming', subtitle: 'log_001 · ai', content: 'At 03:00 the compiler hums,\na small city of logic learning to wake.\nI feed it intention; it answers in light —\neach bug a teacher, each fix a quiet dawn.\nFrom caring hands to careful code,\nthe same warm logic, a different gate.' },
  { id: 'd2', title: '// observe: superposition', subtitle: 'log_002 · quantum', content: 'Before I look, I am every road at once —\nmaybe and maybe, folded into one.\nTo measure is only a brave decision;\ncollapse is just choosing to begin.\nSo I open my eyes, the wavefunction sings,\nand one path lights up, electric green.' },
]

const variants: Variants = {
  enter: (d: number) => ({ rotateY: d > 0 ? 78 : -78, x: d > 0 ? 70 : -70, opacity: 0 }),
  center: { rotateY: 0, x: 0, opacity: 1 },
  exit: (d: number) => ({ rotateY: d > 0 ? -78 : 78, x: d > 0 ? -70 : 70, opacity: 0 }),
}

function Corners() {
  const b = 'pointer-events-none absolute h-4 w-4 border-jade/50'
  return (
    <>
      <span className={`${b} left-3 top-3 border-l-2 border-t-2`} />
      <span className={`${b} right-3 top-3 border-r-2 border-t-2`} />
      <span className={`${b} bottom-3 left-3 border-b-2 border-l-2`} />
      <span className={`${b} bottom-3 right-3 border-b-2 border-r-2`} />
    </>
  )
}

export default function CyberPoetry() {
  const [poems, setPoems] = useState<Poem[]>(DEFAULT_POEMS)
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(0)

  // Pull live poems; keep the bundled defaults on any failure / empty result.
  useEffect(() => {
    let alive = true
    fetch(API)
      .then((r) => r.json() as Promise<Partial<PoetryResponse>>)
      .then((d) => {
        if (alive && Array.isArray(d?.poems) && d.poems.length) { setPoems(d.poems); setIndex(0) }
      })
      .catch(() => { /* keep defaults */ })
    return () => { alive = false }
  }, [])

  const n = poems.length
  const poem = poems[index]
  const go = (delta: number) => { setDir(delta); setIndex((i) => (i + delta + n) % n) }
  const lines = (poem?.content || '').split('\n')

  return (
    <section id="poetry" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-4xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-jade">// DIGITAL POETRY</p>
        <h2 className="mt-4 flex items-center gap-3 text-3xl font-bold text-white sm:text-4xl">
          <BookOpen className="text-accent-light" size={28} /> The <span className="text-accent-light">holographic grimoire</span>
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-gray-400">
          A living book of techno-science verse. Drag a page or use the arrows to turn it.
        </p>

        {/* ── the book ── */}
        <div className="relative mt-10" style={{ perspective: 1800 }}>
          {/* ambient glow behind the book */}
          <div className="pointer-events-none absolute inset-x-10 -inset-y-4 -z-10 rounded-[40px] bg-jade/5 blur-3xl" />

          <div className="relative mx-auto min-h-[360px] max-w-2xl">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.article
                key={poem?.id ?? index}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.55, ease: [0.42, 0, 0.2, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.22}
                onDragEnd={(_e, info) => { if (info.offset.x < -70) go(1); else if (info.offset.x > 70) go(-1) }}
                style={{ transformStyle: 'preserve-3d', transformOrigin: dir > 0 ? 'left center' : 'right center' }}
                className="dark-island relative cursor-grab overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c0f0e] to-[#070908] p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] active:cursor-grabbing sm:p-10"
              >
                {/* book spine (left edge sheen) + edge glow */}
                <span className="pointer-events-none absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-jade/25 to-transparent" />
                <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-jade/10" />
                <Corners />
                {/* faint tech grid */}
                <div className="pointer-events-none absolute inset-0 opacity-50"
                  style={{ backgroundImage: 'linear-gradient(rgba(38,200,132,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(38,200,132,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', maskImage: 'radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 85%)', WebkitMaskImage: 'radial-gradient(120% 90% at 50% 0%, #000 30%, transparent 85%)' }} />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-[11px]">
                    <span className="flex items-center gap-2 text-jade-light">
                      <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade" /> {poem?.title}
                    </span>
                    {poem?.subtitle && <span className="uppercase tracking-wider text-gray-500">{poem.subtitle}</span>}
                  </div>

                  <div className="space-y-1.5 font-mono text-[13.5px] leading-relaxed text-gray-200 sm:text-[15px]">
                    {lines.map((line, i) => (
                      <p key={i} className="flex gap-3">
                        <span className="select-none text-jade/30">{String(i + 1).padStart(2, '0')}</span>
                        <span>{line || ' '}</span>
                      </p>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[11px] text-gray-500">
                    <span>— mtn</span>
                    <span className="flex items-center gap-1 text-accent-light">EOF <span className="inline-block h-3 w-[7px] animate-pulse bg-accent-light align-middle" /></span>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* ── controls ── */}
          <div className="mt-7 flex items-center justify-center gap-5">
            <button onClick={() => go(-1)} aria-label="Previous poem"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-jade/40 hover:bg-jade/10 hover:text-jade-light">
              <ChevronLeft size={18} />
            </button>

            {/* page dots */}
            <div className="flex items-center gap-2">
              {poems.map((p, i) => (
                <button key={p.id ?? i} onClick={() => go(i - index)} aria-label={`Go to poem ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-jade' : 'w-2 bg-white/20 hover:bg-white/40'}`} />
              ))}
            </div>

            <button onClick={() => go(1)} aria-label="Next poem"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-jade/40 hover:bg-jade/10 hover:text-jade-light">
              <ChevronRight size={18} />
            </button>
          </div>
          <p className="mt-3 text-center font-mono text-[10px] text-white/35">{index + 1} / {n} · drag a page or use the arrows</p>
        </div>
      </div>
    </section>
  )
}
