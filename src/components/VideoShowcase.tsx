import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Play } from 'lucide-react'
import { useCyberReveal } from '../hooks/useCyberReveal'

/**
 * VideoShowcase — interactive MASTER-DETAIL video gallery (Batman theme).
 *
 *  • Large cinematic "master" player on top; click a thumbnail to switch it.
 *  • Master starts MUTED (autoplay), with a custom Mute/Unmute toggle.
 *  • Performance: the master <video> only loads when the section is in view.
 *
 *  PLUG IN YOUR REELS: drop files in public/reels/  → reel-1.mp4 … reel-4.mp4
 */

const BASE = import.meta.env.BASE_URL || '/'
const reel = (id: string) => `${BASE}reels/${id}.mp4`
const shot = (id: string) => `${BASE}reels/${id}.webp`

type I18nText = Record<string, string>
interface Reel { id: string; accent: string; caption: I18nText; desc: I18nText }

// 4 selectable reels. `caption`/`desc` are i18n objects ({ en, mm, jp, … }).
const REELS: Reel[] = [
  {
    id: 'reel-1', accent: '#b8860b',
    caption: { en: 'The Journey', mm: 'ခရီး', jp: '旅', zh: '旅程', vn: 'Hành trình', ne: 'यात्रा', id: 'Perjalanan' },
    desc: {
      en: 'Where it begins — the first step into the unknown.',
      mm: 'အစ — အမည်မသိရာဆီသို့ ပထမခြေလှမ်း။',
      jp: '始まり — 未知への最初の一歩。',
      zh: '起点 —— 迈向未知的第一步。',
      vn: 'Nơi bắt đầu — bước đầu tiên vào điều chưa biết.',
      ne: 'सुरुवात — अज्ञाततर्फको पहिलो पाइला।',
      id: 'Tempat bermula — langkah pertama ke yang tak diketahui.',
    },
  },
  {
    id: 'reel-2', accent: '#8e2a2a',
    caption: { en: 'Discipline', mm: 'စည်းကမ်း', jp: '規律', zh: '自律', vn: 'Kỷ luật', ne: 'अनुशासन', id: 'Disiplin' },
    desc: {
      en: 'Built quietly, day after day, when no one is watching.',
      mm: 'မည်သူမျှ မမြင်သည့်အခါ နေ့စဉ် တိတ်တဆိတ် တည်ဆောက်ခြင်း။',
      jp: '誰も見ていない時に、日々静かに積み上げる。',
      zh: '无人注视时，日复一日，默默筑成。',
      vn: 'Xây dựng lặng lẽ, mỗi ngày, khi không ai nhìn.',
      ne: 'कसैले नहेर्दा पनि, दिनप्रतिदिन, चुपचाप निर्माण।',
      id: 'Dibangun diam-diam, hari demi hari, saat tak ada yang melihat.',
    },
  },
  {
    id: 'reel-3', accent: '#cda434',
    caption: { en: 'Breakthrough', mm: 'အောင်မြင်မှု', jp: '突破', zh: '突破', vn: 'Bứt phá', ne: 'सफलता', id: 'Terobosan' },
    desc: {
      en: 'The moment the work finally answers back.',
      mm: 'ကြိုးစားမှုက နောက်ဆုံး ပြန်တုံ့ပြန်လာသည့် အခိုက်အတန့်။',
      jp: '努力がついに応えてくれる瞬間。',
      zh: '努力终于有了回响的那一刻。',
      vn: 'Khoảnh khắc nỗ lực cuối cùng đáp lại.',
      ne: 'मेहनतले अन्ततः जवाफ दिने क्षण।',
      id: 'Saat kerja keras akhirnya menjawab.',
    },
  },
  {
    id: 'reel-4', accent: '#5c1616',
    caption: { en: 'To the Victory', mm: 'အောင်ပွဲဆီ', jp: '勝利へ', zh: '通往胜利', vn: 'Đến vinh quang', ne: 'विजयतर्फ', id: 'Menuju Kemenangan' },
    desc: {
      en: 'Not the finish line — the proof that the path was real.',
      mm: 'ပန်းတိုင်မဟုတ် — လမ်းကြောင်း မှန်ကန်ခဲ့ကြောင်း သက်သေ။',
      jp: 'ゴールではなく、その道が本物だった証。',
      zh: '不是终点 —— 而是这条路真实存在的证明。',
      vn: 'Không phải vạch đích — mà là minh chứng con đường có thật.',
      ne: 'अन्तिम रेखा होइन — बाटो साँचो थियो भन्ने प्रमाण।',
      id: 'Bukan garis akhir — bukti bahwa jalan itu nyata.',
    },
  },
]

interface SectionText { badge: string; title: string; sub: string }
const T: Record<string, SectionText> = {
  en: { badge: 'Showreel', title: 'Highlights in Motion', sub: 'A cinematic look — A 10-second glimpse of life in motion' },
  mm: { badge: 'ရှိုးရီး', title: 'လှုပ်ရှားသော မှတ်တိုင်များ', sub: 'ရုပ်ရှင်ဆန်သော မြင်ကွင်း — အောက်မှ ရွေးပြီး ကြည့်ပါ။' },
  jp: { badge: 'ショーリール', title: '動きで見るハイライト', sub: '下のリールを選んで再生。' },
  zh: { badge: '短片集', title: '动态精选', sub: '电影般的呈现 —— 选择下方短片播放。' },
  vn: { badge: 'Showreel', title: 'Khoảnh khắc nổi bật', sub: 'Chọn một đoạn bên dưới để phát.' },
  ne: { badge: 'शोरिल', title: 'गतिमा झलकहरू', sub: 'तलको रिल छानेर हेर्नुहोस्।' },
  id: { badge: 'Showreel', title: 'Sorotan dalam Gerak', sub: 'Pilih reel di bawah untuk memutar.' },
}

// i18n picker: returns the active language string, falling back to `en`.
const pick = (o: I18nText, lang: string) => (o && (o[lang] || o.en)) || ''

function Thumb({ r, active, onSelect, lang }: { r: Reel; active: boolean; onSelect: () => void; lang: string }) {
  const [ok, setOk] = useState(true)
  return (
    <button
      onClick={onSelect}
      aria-pressed={active}
      className={`group relative flex-1 overflow-hidden rounded-xl border bg-white/[0.03] text-left transition-all duration-300 hover:-translate-y-1 ${
        active ? 'border-accent shadow-[0_0_22px_-6px_rgb(var(--accent)/0.7)]' : 'border-white/10 hover:border-white/30'
      }`}
    >
      <div className="relative aspect-video overflow-hidden">
        {/* themed placeholder behind the poster */}
        <span className="absolute inset-0" style={{ background: `linear-gradient(150deg, ${r.accent}33, #141414 75%)` }} />
        {ok && (
          <img src={shot(r.id)} alt="" loading="lazy" decoding="async" onError={() => setOk(false)}
            className="absolute inset-0 h-full w-full object-cover object-center transform-gpu [backface-visibility:hidden] saturate-[1.15] contrast-[1.06] brightness-95 transition-all duration-500 ease-out group-hover:scale-[1.08] group-hover:saturate-[1.4] group-hover:contrast-110 group-hover:brightness-110" />
        )}
        {/* dim veil lifts on hover so the poster pops into sharp focus */}
        <span className="absolute inset-0 bg-black/25 transition-opacity duration-300 group-hover:bg-transparent" />
        {/* play glyph + active dot */}
        <span className={`absolute inset-0 flex items-center justify-center transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}>
          <Play size={18} className="text-white drop-shadow" fill={active ? 'currentColor' : 'none'} />
        </span>
      </div>
      <span className="block truncate px-3 py-2 font-mono text-[11px] uppercase tracking-wide"
        style={{ color: active ? 'rgb(var(--accent))' : undefined }}>
        {pick(r.caption, lang)}
      </span>
    </button>
  )
}

export default function VideoShowcase({ lang = 'en' }: { lang?: string }) {
  const t = T[lang] || T.en
  const ref = useCyberReveal()
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(0)
  const [muted, setMuted] = useState(true)
  const [inView, setInView] = useState(false)
  const [, setError] = useState(false)
  const current = REELS[active]

  // Lazy: only load/play the master video while the section is on screen.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); else videoRef.current?.pause() },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Keep the element's muted property in sync (React attr alone is unreliable),
  // and (re)play after a source switch / when it scrolls into view.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = muted
    if (inView) v.play().catch(() => {})
  }, [muted, active, inView])

  return (
    <section id="showreel" ref={ref} className="relative overflow-hidden py-20 text-legible">
      <div className="pointer-events-none absolute -top-10 left-1/3 h-72 w-72 rounded-full bg-accent/8 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-maroon/25 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div data-reveal className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">// {t.badge}</p>
          <h2 className="glow-heading mt-2 text-3xl font-bold text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-2 text-gray-400">{t.sub}</p>
        </div>

        {/* ── MASTER player ── cinematic glassmorphism frame */}
        <div ref={wrapRef} data-reveal
          className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] p-2 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95),0_0_50px_-18px_rgb(var(--accent)/0.35)] backdrop-blur-xl ring-1 ring-inset ring-white/5">
          {/* gold top sheen + always-on soft glow ring (cinematic separation) */}
          <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
          <span className="pointer-events-none absolute -inset-px rounded-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"
            style={{ boxShadow: '0 0 60px -14px rgb(var(--accent)/0.45)' }} />

          {/* inner video well: gold hairline ring + crisp clipping */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-accent/20">
            <video
              key={current.id}                               // remount on switch
              ref={videoRef}
              src={inView ? reel(current.id) : undefined}    // lazy load
              poster={shot(current.id)}
              loop playsInline autoPlay preload="none"
              onError={() => setError(true)}
              onLoadedData={() => setError(false)}
              className="h-full w-full object-cover transform-gpu [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
              style={{ transform: 'translateZ(0)' }}
            />

            {/* fallback hint behind the video (shows if file missing) */}
            <div className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center"
              style={{ background: `linear-gradient(150deg, ${current.accent}22, #0c0c0c 87%)` }}>
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/30"></span>
            </div>

            {/* custom Mute / Unmute toggle (glassmorphism + gold) */}
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Unmute' : 'Mute'}
              className="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-black/40 text-accent backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-accent hover:bg-black/60 hover:text-accent-light hover:shadow-[0_0_20px_-4px_rgb(var(--accent)/0.7)]"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          {/* selected reel description — cross-fades on switch */}
          <div className="px-3 pb-2 pt-3 text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="text-sm text-gray-300"
              >
                <span className="font-semibold" style={{ color: 'rgb(var(--accent))' }}>{pick(current.caption, lang)}</span>
                <span className="text-gray-500"> — {pick(current.desc, lang)}</span>
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* ── thumbnail rail (4 reels) ── */}
        <div className="mt-5 flex gap-3 sm:gap-4">
          {REELS.map((r, i) => (
            <Thumb key={r.id} r={r} active={i === active} onSelect={() => setActive(i)} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}
