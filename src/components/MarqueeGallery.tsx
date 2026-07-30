import { useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { PROJECTS } from '../data/content'
import { ASSETS } from '../config/assets'
import '../marquee.css'

/**
 * MarqueeGallery — a continuous horizontal marquee of project names. Hovering a
 * name reveals its image, which smoothly follows the cursor (Framer Motion).
 */
const FALLBACK = ASSETS.fallback

interface MarqueeItem { title: string; image: string; url?: string }

export default function MarqueeGallery({ items }: { items?: MarqueeItem[] }) {
  // Map your existing PROJECTS to {title, image}. PROJECTS carry no image field,
  // so we use the shared placeholder unless explicit `items` are passed in.
  const data: MarqueeItem[] = items ?? PROJECTS.map((p) => ({
    title: p.title,
    image: FALLBACK,
    url: p.url,
  }))

  const [hovered, setHovered] = useState<MarqueeItem | null>(null)
  const wrapRef = useRef<HTMLElement>(null)

  // Smooth cursor-following position via springs
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 250, damping: 28, mass: 0.5 })
  const y = useSpring(my, { stiffness: 250, damping: 28, mass: 0.5 })

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = wrapRef.current?.getBoundingClientRect()
    if (!r) return
    mx.set(e.clientX - r.left)
    my.set(e.clientY - r.top)
  }

  // Duplicate the list so the -50% loop is seamless
  const row = [...data, ...data]

  return (
    <section
      id="explore-projects"
      ref={wrapRef}
      onMouseMove={onMove}
      className="relative overflow-hidden bg-transparent py-20 sm:py-28"
    >
      {/* heading */}
      <div className="mb-8 px-6 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-accent-light">// explore</p>
        <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Hover to Preview</h2>
      </div>

      {/* cursor-following image */}
      <AnimatePresence>
        {hovered && (
          <motion.img
            key={hovered.title}
            src={hovered.image}
            alt={hovered.title}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ left: x, top: y }}
            className="pointer-events-none absolute z-20 hidden h-52 w-80 -translate-x-1/2 -translate-y-1/2
                       rounded-2xl object-cover shadow-2xl shadow-black/60 ring-1 ring-accent/40 md:block"
          />
        )}
      </AnimatePresence>

      {/* marquee */}
      <div className="marquee-mask relative">
        <div className="marquee-track">
          {row.map((it, i) => (
            <span
              key={`${it.title}-${i}`}
              onMouseEnter={() => setHovered(it)}
              onMouseLeave={() => setHovered(null)}
              className={`cursor-default select-none whitespace-nowrap text-4xl font-extrabold uppercase tracking-tight transition-colors duration-200 sm:text-6xl
                ${hovered && hovered.title === it.title ? 'text-accent-light' : 'text-white/25 hover:text-white'}`}
            >
              {it.title}
              <span className="mx-6 align-middle text-accent/60">◆</span>
            </span>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center font-mono text-xs text-muted">hover a title to preview its project</p>
    </section>
  )
}
