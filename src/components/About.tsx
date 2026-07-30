import type { CSSProperties } from 'react'
import { PERSONAL, SKILLS } from '../data/content'
import { useCyberReveal } from '../hooks/useCyberReveal'

// Inline styles that set CSS custom properties (e.g. `--g`) — React's CSSProperties
// doesn't allow arbitrary `--*` keys in an inline literal, so widen with this.
type CSSVars = CSSProperties & Record<`--${string}`, string | number>

interface AboutText { title: string; bio: string; slogan: string; skills: string }
const T: Record<string, AboutText> = {
  mm: { title: 'ကျတော့် အကြောင်း', bio: 'ဂျပန်တွင် နေထိုင်သည်။ တိုးတက်ပြောင်းလဲနေသော Ai ခေတ်သစ်ဆီသို့', slogan: 'ဘယ်တော့မှ မစတင်ဖြစ်ခဲ့တာထက်စာရင် နောက်ကျတာက ပိုကောင်းပါတယ်။', skills: 'အဓိက ကျွမ်းကျင်မှုများ' },
  en: { title: 'About Me', bio: 'Living in Japan. Advancing towards the evolving new era of AI.', slogan: 'Better late than never.', skills: 'Core Competencies' },
  jp: { title: '私について', bio: '日本在住。進化し続ける新しいAI時代へ。', slogan: '遅れても、全くやらないよりはまし。', skills: 'コアスキル' },
  vn: { title: 'Về Tôi', bio: 'Sống ở Nhật Bản. Hướng tới kỷ nguyên AI mới đang không ngừng phát triển.', slogan: 'Thà muộn còn hơn không.', skills: 'Năng lực cốt lõi' },
  ne: { title: 'मेरो बारेमा', bio: 'जापानमा बसोबास। विकासशील नयाँ एआई (AI) युगको तर्फ।', slogan: 'कहिल्यै सुरु नगर्नुभन्दा ढिलो सुरु गर्नु राम्रो हो।', skills: 'मुख्य दक्षताहरू' },
  id: { title: 'Tentang Saya', bio: 'Tinggal di Jepang. Melangkah menuju era baru AI yang terus berkembang.', slogan: 'Lebih baik terlambat daripada tidak sama sekali.', skills: 'Kompetensi Inti' },
}

interface AboutProps { lang?: string }

interface QuickFact { icon: string; label: string; value: string }
const QUICK_FACTS: QuickFact[] = [
  { icon: 'fas fa-graduation-cap', label: 'Computer Science University', value: 'Enrolled' },
  { icon: 'fas fa-briefcase-medical', label: 'Background', value: 'International Relations & Healthcare' },
  { icon: 'fas fa-code', label: 'Focus', value: 'AI / Web Dev' },
  { icon: 'fas fa-language', label: 'Languages', value: 'EN · JP · MY' },
]

export default function About({ lang = 'en' }: AboutProps) {
  const t = T[lang] || T.en
  // GSAP ScrollTrigger reveals, synced to the same scroll as the 3D camera.
  const sectionRef = useCyberReveal()

  return (
    <section id="about" ref={sectionRef} className="relative py-28 border-t border-white/5 overflow-hidden text-legible">
      {/* crystal-clear: faint tint only, NO blur — the 3D city shows through.
          Readability comes from .text-legible (inherited dark text-shadow). */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      {/* ambient glows */}
      <div className="absolute -top-20 left-1/4 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)), transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)), transparent 70%)' }} />
      {/* deep muted crimson accent — subtle psychological depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-[0.08]"
        style={{ background: 'radial-gradient(ellipse, rgb(var(--maroon)), transparent 70%)' }} />

      <div className="section-container relative z-10">
        {/* Header */}
        <div data-reveal className="mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-accent-light mb-4">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-light" /> Who I Am
          </span>
          <h2 className="section-title">
            <span className="bg-gradient-to-r from-white via-accent-light to-cyan bg-clip-text text-transparent">{t.title}</span>
          </h2>
        </div>

        {/* Profile + Bio */}
        <div data-reveal className="grid md:grid-cols-[auto_1fr] gap-12 items-center mb-16">
          {/* Photo — hi-tech framed */}
          <div className="flex justify-center md:justify-start">
            <div className="group relative">
              {/* rotating gradient halo */}
              <div className="absolute -inset-1 rounded-[28px] opacity-70 blur-md transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: 'conic-gradient(from 0deg, rgb(var(--accent)), rgb(var(--accent)), #ff1e3c, rgb(var(--accent)))' }} />
              <div className="relative w-64 h-64 rounded-3xl overflow-hidden bg-card flex items-center justify-center ring-1 ring-white/10">
                <span className="absolute text-5xl font-bold text-accent/30 select-none">MTN</span>
                <picture>
                  {PERSONAL.photoWebp && <source srcSet={PERSONAL.photoWebp} type="image/webp" />}
                  <img
                    src={PERSONAL.photo}
                    alt={PERSONAL.name}
                    width="256" height="256"
                    className="relative w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager" decoding="async" fetchPriority="high"
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                  />
                </picture>
                {/* HUD corner brackets */}
                <span className="absolute left-2 top-2 w-5 h-5 border-l-2 border-t-2 border-cyan/70 rounded-tl" />
                <span className="absolute right-2 bottom-2 w-5 h-5 border-r-2 border-b-2 border-cyan/70 rounded-br" />
              </div>
              {/* Floating status badge (glass) */}
              <div className="absolute -bottom-4 -right-4 backdrop-blur-xl bg-white/5 border border-white/15 rounded-2xl px-4 py-2 shadow-xl animate-float motion-reduce:animate-none">
                <p className="text-[10px] uppercase tracking-wider text-muted">Based in</p>
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Japan 🇯🇵
                </p>
              </div>
            </div>
          </div>

          {/* Bio — glass card */}
          <div className="relative rounded-3xl border border-white/10 bg-black/15 backdrop-blur-sm p-7 md:p-9 space-y-6"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 60px -30px rgb(var(--accent)/0.4)' }}>
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{PERSONAL.name}</h3>
              <p className="text-accent-light text-sm font-mono">{PERSONAL.handle}</p>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">{t.bio}</p>

            {/* Quote */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
              <i className="fas fa-quote-left text-accent-light/60 mt-0.5 text-lg flex-shrink-0" />
              <p className="text-gray-200 text-sm font-medium italic">{t.slogan}</p>
            </div>

            {/* Quick facts — glass tiles with glowing icons */}
            <div className="grid grid-cols-2 gap-3">
              {QUICK_FACTS.map(({ icon, label, value }) => (
                <div key={label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/8 hover:border-accent/40 hover:bg-accent/5 transition-all duration-200">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent-light"
                    style={{ boxShadow: '0 0 14px -2px rgb(var(--accent)/0.6)' }}>
                    <i className={`${icon} text-sm`} />
                  </span>
                  <div>
                    <p className="text-xs text-muted">{label}</p>
                    <p className="text-sm font-medium text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills — glowing glass chips */}
        <div data-reveal>
          <p className="text-accent-light text-sm font-semibold uppercase tracking-widest mb-6">{t.skills}</p>
          <div className="flex flex-wrap gap-2.5">
            {SKILLS.map(({ name, icon, color }) => (
              <div
                key={name}
                className="skill-chip flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/8 backdrop-blur-sm hover:-translate-y-0.5 hover:border-white/25 transition-all duration-200 group cursor-default"
                style={{ '--g': color } as CSSVars}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 18px -4px ${color}` }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <i
                  className={`${icon} text-sm transition-transform duration-200 group-hover:scale-110`}
                  style={{ color, filter: `drop-shadow(0 0 6px ${color}99)` }}
                />
                <span className="text-sm text-gray-200 font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
