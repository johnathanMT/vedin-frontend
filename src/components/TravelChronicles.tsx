import { useState, useEffect, type CSSProperties } from 'react'
import { BLOG_POSTS } from '../data/content'
import { useCyberReveal } from '../hooks/useCyberReveal'

// Inline style that sets a CSS custom property (--c).
type CSSVars = CSSProperties & Record<`--${string}`, string | number>

const TAG_CLASS: Record<string, string> = {
  Travel:       'tag-travel',
  Musings:      'tag-musings',
  'Care Giving':'tag-care-giving',
}

const SIZE_CLASS: Record<string, string> = { large: 'bento-large', medium: 'bento-medium', wide: 'bento-wide' }

const LANG_LABELS: Record<string, string> = {
  en: 'English', mm: 'မြန်မာ', jp: '日本語', vn: 'Tiếng Việt', ne: 'नेपाली', id: 'Bahasa',
}

// A blog post from src/data/content (still JS); this mirrors its shape.
interface PostBody { excerpt: string; body: string }
interface BlogPost {
  id: string
  size: string
  date: string
  tag: string
  img: string
  title: Record<string, string>
  translations: Record<string, PostBody>
}

function BentoCard({ post, onClick, lang }: { post: BlogPost; onClick: (post: BlogPost) => void; lang: string }) {
  const sizeClass = SIZE_CLASS[post.size] || 'bento-medium'
  const tr = post.translations[lang] || post.translations.en
  const title = post.title[lang] || post.title.en

  return (
    <div className={`bento-card ${sizeClass} group`} onClick={() => onClick(post)}>
      <div className="bg-layer" style={{ backgroundImage: `url(${post.img})` }} />
      <div className="overlay" />
      <div className="info">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TAG_CLASS[post.tag] || 'bg-white/10 text-gray-400'}`}>
            {post.tag}
          </span>
          <span className="text-xs text-gray-400">{post.date}</span>
        </div>
        <h3 className="text-white font-bold text-xl leading-snug mb-1.5">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">{tr.excerpt}</p>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold"
          style={{ color: 'rgb(var(--coral))' }}>
          <span>Read more</span>
          <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  )
}

function Modal({ post, lang, setLang, onClose }: { post: BlogPost | null; lang: string; setLang: (code: string) => void; onClose: () => void }) {
  const isOpen = Boolean(post)

  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [isOpen, onClose])

  if (!post) return null

  const tr    = post.translations[lang] || post.translations.en
  const title = post.title[lang] || post.title.en

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-box">
        {/* Hero image */}
        <div className="relative h-60 overflow-hidden rounded-t-3xl">
          <img src={post.img} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #1a1414, transparent 60%)' }} />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 flex items-center justify-center text-white transition-all z-10">
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          {/* Language switcher */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {Object.entries(LANG_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                  lang === code
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${TAG_CLASS[post.tag] || ''}`}>
              {post.tag}
            </span>
            <span className="text-xs text-gray-500">{post.date}</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6 leading-tight">{title}</h2>

          <div className="space-y-4 border-l-2 border-rose-500/30 pl-5">
            {tr.body.split('\n\n').map((para, i) => (
              <p key={i} className="text-gray-300 text-sm leading-[1.85]">{para}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TravelChronicles({ lang, setLang }: { lang: string; setLang: (code: string) => void }) {
  const [activePost, setActivePost] = useState<BlogPost | null>(null)
  const sectionRef = useCyberReveal()   // GSAP ScrollTrigger reveals, synced to the 3D camera

  return (
    <section id="blog" ref={sectionRef} className="relative py-24 border-t border-white/5 text-legible"
      style={{ '--c': 'rgb(var(--coral))' } as CSSVars}>
      {/* crystal-clear: faint tint only, no blur (readability via .text-legible) */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      {/* Rose-tinted bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(20, 20, 20,0.5) 0%, transparent 40%, transparent 60%, rgba(20, 20, 20,0.5) 100%)' }} />
      <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(ellipse, rgb(var(--coral)), transparent)' }} />

      <div className="section-container relative z-10">
        {/* Header */}
        <div data-reveal className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="section-badge">Chronicles</span>
            <h2 className="section-title">
              <span className="accent-gradient-rose">Travel Chronicles</span> ✈️
            </h2>
            <p className="section-subtitle">Journey through the lens of a developer.</p>
          </div>

          {/* Global language switcher for cards */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(LANG_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  lang === code
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-white/4 border-white/8 text-gray-500 hover:text-white hover:bg-white/8'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div data-reveal className="bento-grid">
          {BLOG_POSTS.map((post) => (
            <BentoCard key={post.id} post={post} lang={lang} onClick={setActivePost} />
          ))}
        </div>
      </div>

      <Modal post={activePost} lang={lang} setLang={setLang} onClose={() => setActivePost(null)} />
    </section>
  )
}
