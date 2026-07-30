import { useEffect, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, ArrowUpRight } from 'lucide-react'
import { api } from '../lib/portfolioApi'
import { ASSETS } from '../config/assets'
import type { Article, EntityId } from '../types/api'

// Inline style that sets a CSS custom property (--b).
type CSSVars = CSSProperties & Record<`--${string}`, string | number>

/**
 * ArticlesSection — "Cyber Portal".
 * Article cards materialise out of a glowing sci-fi doorway: a luminous portal
 * ring sits at the top, and each card rises + un-blurs into place with a
 * staggered Framer-Motion entrance, as if projected through the gateway.
 */
export default function ArticlesSection() {
  const [items, setItems] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.wake()
    ;(async () => {
      try {
        const r = await api.getArticles({ pageSize: 9 })
        setItems([...(r?.data?.items ?? [])])   // Paged.items is readonly → copy into mutable state
      } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load') } finally { setLoading(false) }
    })()
  }, [])

  const blogHref = (id: EntityId) => `${import.meta.env.BASE_URL}blog.html?id=${id}`
  const preview = (a: Article): string => a.imageUrls?.[0] || a.imageUrl || ASSETS.fallback
  const reactTotal = (a: Article): number => {
    const r: Record<string, number> = a.reactions ?? {}
    return Object.values(r).reduce((s, n) => s + (n || 0), 0)
  }

  return (
    <section id="articles" className="relative overflow-hidden py-28">
      {/* deep-space backdrop */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(120% 60% at 50% 0%, rgba(212, 175, 55,0.18), transparent 60%), radial-gradient(80% 50% at 50% 100%, rgba(212, 175, 55,0.10), transparent 70%), radial-gradient(50% 45% at 50% 55%, rgba(150,20,40,0.10), transparent 72%)' }} />

      {/* ── The portal / doorway ── */}
      <div className="relative z-10 mx-auto mb-16 flex max-w-4xl flex-col items-center px-6 text-center">
        <div className="cyber-portal" aria-hidden>
          <span className="portal-ring portal-ring--1" />
          <span className="portal-ring portal-ring--2" />
          <span className="portal-core" />
          <span className="portal-beam" />
        </div>

        <p className="mt-2 font-mono text-sm uppercase tracking-[0.4em] text-accent-light">// transmission</p>
        <h2 className="glow-heading mt-3 text-4xl font-bold sm:text-5xl">
          <span className="bg-gradient-to-r from-white via-accent-light to-cyan bg-clip-text text-transparent">Articles</span>
        </h2>
        <p className="mt-3 max-w-md text-sm text-gray-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.9)]">Signals emerging from the archive — click any to open the full transmission.</p>
        <a href={`${import.meta.env.BASE_URL}blog.html`} className="mt-5 inline-flex items-center gap-2 font-mono text-sm text-cyan hover:text-white transition-colors">
          All posts <ArrowUpRight size={15} />
        </a>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {loading && <p className="text-center font-mono text-muted">Establishing uplink…</p>}
        {error && !loading && <p className="text-center font-mono text-coral">Couldn't load articles: {error}</p>}
        {!loading && !error && items.length === 0 && <p className="text-center font-mono text-muted">No transmissions yet.</p>}

        {/* Cards materialising from the portal */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => (
            <motion.a
              key={a.id}
              href={blogHref(a.id)}
              initial={{ opacity: 0, y: 60, scale: 0.82, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.12 + Math.floor(i / 3) * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
            >
              {/* portal-glow edge on hover */}
              <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ boxShadow: '0 0 30px -4px rgba(212, 175, 55,0.6), inset 0 0 30px -10px rgba(212, 175, 55,0.5)' }} />

              <div className="relative h-44 overflow-hidden">
                {/* the real image — encrypted (blurred/desaturated) until hover */}
                <img src={preview(a)} alt="" loading="lazy" decoding="async" className="radio-img h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />

                {/* Default "encrypted signal" veil: scanning grid + radio wave + EQ bars */}
                <div className="radio-veil">
                  <div className="radio-grid" />
                  <svg className="radio-wave" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden>
                    <path d="M0,30 Q12.5,4 25,30 T50,30 T75,30 T100,30 T125,30 T150,30 T175,30 T200,30" />
                  </svg>
                  <div className="radio-bars" aria-hidden>
                    {Array.from({ length: 20 }).map((_, b) => <span key={b} style={{ '--b': b } as CSSVars} />)}
                  </div>
                  <span className="radio-status">▮ SIGNAL&nbsp;LOCKED</span>
                </div>

                {/* decryption scan-line that sweeps down on hover */}
                <span className="radio-scan" aria-hidden />

                <span className="absolute left-3 top-3 z-20 font-mono text-[11px] tabular-nums text-cyan/90">{String(i + 1).padStart(2, '0')}</span>
              </div>

              <div className="p-5">
                <h3 className="line-clamp-2 text-lg font-semibold text-white transition-colors group-hover:text-cyan">{a.title}</h3>
                <p className="mt-1 truncate font-mono text-xs text-muted">
                  {a.author}{a.publishedDate ? ` · ${new Date(a.publishedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                </p>
                <div className="mt-4 flex items-center gap-4 font-mono text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Heart size={13} /> {a.likeCount || 0}</span>
                  <span className="inline-flex items-center gap-1"><Sparkles size={13} /> {reactTotal(a)}</span>
                  <ArrowUpRight size={16} className="ml-auto text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
