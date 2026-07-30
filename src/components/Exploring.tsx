import { useRef, useState, type CSSProperties } from 'react'
import { INTERESTS, PERSONAL } from '../data/content'
import { useCyberReveal } from '../hooks/useCyberReveal'
import { getSceneImage } from '../lib/sceneImage'

/**
 * Exploring — "Polymath" interests with CINEMATIC HOVER PREVIEWS.
 *
 *  On hover each card cross-fades (opacity + scale) to a cinematic scene + an
 *  original life-philosophy slogan over a dark scrim for readability.
 *
 *  Scene source (layered fallback, all graceful):
 *    1. Local still  src/assets/images/scenes/<slug>.webp   (zero-config, fastest)
 *    2. Lazy Unsplash fetch by THEME query (royalty-free) — only on first hover
 *    3. Themed Batman/Old-Gold gradient if nothing loads → never a broken image.
 */

// Inline styles that set CSS custom properties (--card-c, --c).
type CSSVars = CSSProperties & Record<`--${string}`, string | number>

// Local stills (optional). Bind by interest slug.
const SCENES = import.meta.glob<string>(
  '../assets/images/scenes/*.{webp,jpg,jpeg,png,avif}',
  { eager: true, import: 'default', query: '?url' },
)
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const localScene = (title: string): string | null => {
  const key = `/${slugify(title)}.`
  const hit = Object.entries(SCENES).find(([p]) => p.toLowerCase().includes(key))
  return hit ? hit[1] : null
}

// Original cinematic slogans (themes: growth · discipline · journey).
const SLOGANS: Record<string, string> = {
  'Cosmology': 'We are stardust, learning to read the sky.',
  'Quantum Theory': 'Observe boldly — reality answers the curious mind.',
  'Linguistics': 'Every language learned is another window on the world.',
  'FE / IT Study': 'Master the fundamentals; the future is built on them.',
  'Occultism': 'The hidden is only knowledge waiting for the brave.',
  'Fortune Prediction': 'The future favours a mind that prepares for it.',
  'General Knowledge': 'Curiosity is the engine of every great journey.',
  'Unconditional Joke': 'Laughter is the shortest distance between two minds.',
}

// Royalty-free Unsplash search query per interest (evokes the cinematic mood).
const QUERIES: Record<string, string> = {
  'Cosmology': 'galaxy nebula cosmos',
  'Quantum Theory': 'abstract light particles',
  'Linguistics': 'old library books',
  'FE / IT Study': 'code developer screen night',
  'Occultism': 'mystic candles dark',
  'Fortune Prediction': 'tarot cards mystical',
  'General Knowledge': 'grand library knowledge',
  'Unconditional Joke': 'theatre stage spotlight',
}

interface Interest { title: string; desc: string; icon: string; color: string; page: string }

function ExploreCard({ item }: { item: Interest }) {
  const { title, desc, icon, color, page } = item
  const slogan = SLOGANS[title] || PERSONAL.slogan
  const [remote, setRemote] = useState<string | null>(null)
  const tried = useRef(false)

  // Lazy-fetch a scene the first time the card is hovered (not on mount).
  const onEnter = () => {
    if (tried.current) return
    tried.current = true
    if (!localScene(title)) getSceneImage(QUERIES[title] || title).then((u) => { if (u) setRemote(u) })
  }

  const scene = localScene(title) || remote

  return (
    <a
      href={page}
      onMouseEnter={onEnter}
      onFocus={onEnter}
      className="poly-card group relative isolate flex min-h-[190px] flex-col gap-3 overflow-hidden p-5"
      style={{ '--card-c': color } as CSSVars}
    >
      {/* ── default content ── */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <i className={`${icon} text-base`} style={{ color }} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold mt-1" style={{ color }}>
        <span>Explore</span><i className="fas fa-arrow-right text-[9px]" />
      </div>

      {/* ── cinematic hover overlay (cross-fade: opacity + scale) ── */}
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100">
        {/* scene still (local or fetched) OR themed gradient fallback */}
        <span
          className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-100"
          style={scene
            ? { backgroundImage: `url(${scene})` }
            : { background: `radial-gradient(120% 90% at 30% 10%, ${color}55, transparent 55%), linear-gradient(160deg, ${color}33, #0c0c0c 80%)` }}
        />
        {/* dark scrim for perfect text readability */}
        <span className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/60 to-black/45" />
        <span className="absolute inset-x-0 top-0 h-1.5 w-full" style={{ background: color }} />
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 text-center">
          <i className={`${icon} text-lg`} style={{ color }} />
          <span className="text-sm font-semibold italic leading-snug text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.95)]">
            “{slogan}”
          </span>
        </span>
      </span>
    </a>
  )
}

export default function Exploring() {
  const sectionRef = useCyberReveal()

  return (
    <section id="exploring" ref={sectionRef} className="relative py-24 border-t border-white/5 text-legible"
      style={{ '--c': 'rgb(var(--accent))' } as CSSVars}>
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(20, 20, 20,0.5) 0%, transparent 40%, transparent 60%, rgba(20, 20, 20,0.5) 100%)' }} />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(ellipse, rgb(var(--accent)), rgb(var(--coral)), transparent)' }} />

      {/* Starfield dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 0.5 + 'px', height: Math.random() * 2 + 0.5 + 'px',
              left: Math.random() * 100 + '%', top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.4 + 0.1,
              animation: `blink ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
            }} />
        ))}
      </div>

      <div className="section-container relative z-10">
        <div data-reveal className="mb-8">
          <span className="section-badge">Polymath</span>
          <h2 className="section-title">
            Exploring the Infinite <span className="accent-gradient">🌌</span>
          </h2>
          <p className="text-xs uppercase tracking-widest text-gray-600 mb-4">The Master of Jack of All Trades</p>
        </div>

        {/* Heinlein quote */}
        <div data-reveal className="mb-14 max-w-3xl">
          <div className="relative p-6 rounded-2xl overflow-hidden"
            style={{ background: 'rgb(var(--accent)/0.05)', border: '1px solid rgb(var(--accent)/0.15)' }}>
            <div className="absolute top-0 left-0 w-1 h-full rounded-full"
              style={{ background: 'linear-gradient(180deg, rgb(var(--accent)), rgb(var(--coral)))' }} />
            <i className="fas fa-quote-left text-accent/30 text-3xl absolute top-4 right-5" />
            <p className="text-gray-400 text-sm leading-[1.9] italic pl-4">{PERSONAL.heinlein}</p>
          </div>
        </div>

        {/* Interest grid — cinematic hover preview per card */}
        <div data-reveal className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {INTERESTS.map((item) => <ExploreCard key={item.title} item={item} />)}
        </div>
      </div>
    </section>
  )
}
