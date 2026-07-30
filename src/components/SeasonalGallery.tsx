import { useRef, useState } from 'react'
import { motion, useMotionValue, useMotionTemplate, useAnimationFrame } from 'framer-motion'
import { useCyberReveal } from '../hooks/useCyberReveal'
import { MONTHS } from '../data/content'

/**
 * SeasonalGallery — "Year in Focus" → Myanmar's 12 Months of Festivals,
 * as a premium INFINITE MARQUEE (Framer Motion, GPU transform).
 *
 *  • Cards flow right → left forever (two duplicated sets → seamless wrap at -50%).
 *  • Hover anywhere PAUSES the marquee; the hovered card scales up with a gold glow.
 *  • Respects prefers-reduced-motion (falls back to a manual horizontal scroll).
 *  • Images auto-bind from src/assets/images/months/ (slug). Missing → placeholder.
 */

const MONTH_IMAGES = import.meta.glob<string>(
  '../assets/images/months/*.{webp,jpg,jpeg,png,avif}',
  { eager: true, import: 'default', query: '?url' },
)
const imgForFile = (file: string | undefined): string | null => {
  if (!file) return null
  const key = `/${file.toLowerCase()}.`
  const hit = Object.entries(MONTH_IMAGES).find(([path]) => path.toLowerCase().includes(key))
  return hit ? hit[1] : null
}

interface SectionText { badge: string; title: string; sub: string }
const T: Record<string, SectionText> = {
  en: { badge: 'Year in Focus', title: 'Myanmar · 12 Months of Festivals', sub: 'One celebration for every month — hover to pause and focus a card.' },
  mm: { badge: 'တစ်နှစ်တာ', title: 'မြန်မာ့ ၁၂ လ ပွဲတော်များ', sub: 'လတိုင်းအတွက် ပွဲတော်တစ်ခု — ရပ်တန့်ကြည့်ရန် mouse တင်ပါ။' },
  jp: { badge: '一年の歩み', title: 'ミャンマー · 12ヶ月の祭り', sub: '毎月ひとつのお祭り — ホバーで一時停止。' },
  vn: { badge: 'Một năm', title: 'Myanmar · 12 Tháng Lễ Hội', sub: 'Mỗi tháng một lễ hội — di chuột để tạm dừng.' },
  ne: { badge: 'वर्ष', title: 'म्यानमार · १२ महिने चाडपर्व', sub: 'हरेक महिना एउटा चाड — होभरमा रोकिन्छ।' },
  id: { badge: 'Setahun', title: 'Myanmar · 12 Bulan Festival', sub: 'Satu perayaan tiap bulan — arahkan kursor untuk menjeda.' },
  zh: { badge: '年度回顾', title: '缅甸 · 十二个月的节日', sub: '每月一个庆典 —— 悬停可暂停并聚焦卡片。' },
}

// i18n field (en/mm/jp/…) and a month record from src/data/content (still JS).
type I18nText = Record<string, string>
interface Month {
  name: string
  mm?: string
  greg?: string
  region?: string
  color: string
  file?: string
  img?: string
  festival: I18nText
  desc: I18nText
}

function MonthCard({ m, lang = 'en' }: { m: Month; lang?: string }) {
  const [imgOk, setImgOk] = useState(true)
  const abbr = m.name.slice(0, 3)
  const pick = (o: I18nText) => (o && (o[lang] || o.en)) || ''
  const festival = pick(m.festival)
  const src = imgForFile(m.file) || m.img

  return (
    <figure
      className="group relative mr-5 h-[400px] w-[260px] flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:z-10 hover:scale-[1.04] hover:border-accent/50 hover:shadow-[0_0_34px_-6px_rgb(var(--accent)/0.6)] sm:w-[300px]"
    >
      {/* themed placeholder behind the photo */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: `radial-gradient(120% 80% at 50% 20%, ${m.color}33, transparent 60%), linear-gradient(160deg, ${m.color}22, #141414 70%)` }}
        aria-hidden
      >
        <span className="font-mono text-6xl font-black tracking-tight" style={{ color: `${m.color}55` }}>{abbr}</span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: `${m.color}aa` }}>Myanmar</span>
      </div>

      {src && imgOk && (
        <img
          src={src}
          alt={`${festival} — ${m.name}`}
          loading="lazy" decoding="async"
          onError={() => setImgOk(false)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <span className="absolute left-0 top-0 h-1 w-full" style={{ background: m.color }} />
      <figcaption className="absolute inset-x-0 bottom-0 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em]" style={{ color: m.color }}>
          {m.name}{m.greg ? ` · ${m.greg}` : ''}
        </p>
        <h3 className="mt-1 text-lg font-bold leading-snug text-white">{festival}</h3>
        <p className="mt-0.5 text-xs text-gray-300">{m.mm ? `${m.mm} · ` : ''}{m.region}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {pick(m.desc)}
        </p>
      </figcaption>
    </figure>
  )
}

export default function SeasonalGallery({ lang = 'en' }: { lang?: string }) {
  const t = T[lang] || T.en
  const ref = useCyberReveal()

  // Infinite marquee via a motion value driven by the rAF loop (GPU transform).
  const x = useMotionValue(0)
  const transform = useMotionTemplate`translateX(${x}%)`
  const paused = useRef(false)
  const reduce = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false)

  useAnimationFrame((_, delta) => {
    if (paused.current || reduce) return
    const SPEED = 3.2 // % of the (doubled) track per second — slow & premium
    let next = x.get() - (SPEED * delta) / 1000
    if (next <= -50) next += 50   // wrap seamlessly (two identical card sets)
    x.set(next)
  })

  return (
    <section id="seasonal" ref={ref} className="relative overflow-hidden border-t border-white/5 py-24 text-legible">
      <div className="pointer-events-none absolute -top-10 right-1/4 h-72 w-72 rounded-full bg-accent/8 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-maroon/25 blur-[150px]" />

      <div className="relative z-10 mx-auto mb-10 max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">// {t.badge}</p>
        <h2 className="glow-heading mt-2 text-3xl font-bold text-white sm:text-4xl">{t.title}</h2>
        <p className="mt-2 max-w-lg text-gray-400">{t.sub}</p>
      </div>

      {/* marquee viewport — hover pauses; edges fade for a premium framed look */}
      <div
        className={`relative z-10 ${reduce ? 'overflow-x-auto' : 'overflow-hidden'}`}
        style={{ maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)' }}
        onMouseEnter={() => { paused.current = true }}
        onMouseLeave={() => { paused.current = false }}
      >
        <motion.div className="flex w-max px-6" style={reduce ? undefined : { transform }}>
          {[...MONTHS, ...MONTHS].map((m, i) => (
            <MonthCard key={`${m.name}-${i}`} m={m} lang={lang} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
