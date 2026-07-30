import { Link } from 'react-router-dom'
import { useCyberReveal } from '../hooks/useCyberReveal'
import { useGallery } from '../hooks/useGallery'

/**
 * GallerySection — homepage "Memory Gallery" (HIGHLIGHTS ONLY).
 *
 *  Hexagons are sourced from src/assets/images/highlights/ via useGallery();
 *  the full collection lives on the dedicated /gallery page. No modal/lightbox —
 *  hovering a hexagon gives a subtle, elegant scale-up (and the caption).
 *
 *  Layout: left copy + right staggered HEXAGON grid (dark glass + amber accents).
 */

// Pointy-top regular hexagon (aspect ratio 1 : 1.1547 keeps it regular).
const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

interface SectionText { badge: string; title: string; accent: string; sub: string; cta: string; all: string }

// Section copy (i18n). Per-photo captions come from galleryData.js (optional).
const T: Record<string, SectionText> = {
  en: { badge: 'GALLERY',   title: 'A collection of', accent: 'moments & memories', sub: 'Photos from the journey — places, projects, and people along the way.', cta: 'Read the blog', all: 'See all photos' },
  mm: { badge: 'ပြခန်း',     title: 'စုဆောင်းထားသော', accent: 'အမှတ်တရ ခဏများ',     sub: 'ခရီးတစ်လျှောက်မှ ဓာတ်ပုံများ — နေရာများ၊ ပရောဂျက်များနှင့် လူများ။',        cta: 'ဘလော့ဖတ်ရန်', all: 'ဓာတ်ပုံအားလုံး' },
  jp: { badge: 'ギャラリー', title: '集めた',          accent: '瞬間と思い出',       sub: '旅の写真 — 場所、プロジェクト、出会った人々。',                                cta: 'ブログを読む', all: 'すべて見る' },
  vn: { badge: 'THƯ VIỆN',  title: 'Bộ sưu tập',     accent: 'khoảnh khắc & kỷ niệm', sub: 'Ảnh từ hành trình — địa điểm, dự án và những con người.',                  cta: 'Đọc blog', all: 'Xem tất cả ảnh' },
  ne: { badge: 'ग्यालरी',    title: 'संग्रह',          accent: 'क्षण र सम्झनाहरू',    sub: 'यात्राका तस्बिरहरू — ठाउँ, परियोजना र मानिसहरू।',                            cta: 'ब्लग पढ्नुहोस्', all: 'सबै तस्बिर हेर्नुहोस्' },
  id: { badge: 'GALERI',    title: 'Koleksi',        accent: 'momen & kenangan',   sub: 'Foto dari perjalanan — tempat, proyek, dan orang-orang.',                  cta: 'Baca blog', all: 'Lihat semua foto' },
  zh: { badge: '画廊',      title: '收藏',           accent: '瞬间与回忆',          sub: '旅途中的照片 —— 地方、项目与遇见的人。',                                      cta: '阅读博客', all: '查看全部照片' },
}

export default function GallerySection({ lang = 'en' }: { lang?: string }) {
  const t = T[lang] || T.en
  const ref = useCyberReveal()
  const { highlights, captionOf, altOf } = useGallery(lang)

  return (
    <section id="gallery" ref={ref} className="relative overflow-hidden py-24">
      {/* calm maroon + gold ambient glows (no busy dot-grid) */}
      <div className="pointer-events-none absolute -top-10 right-1/4 h-80 w-80 rounded-full bg-maroon/25 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-accent/8 blur-[150px]" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        {/* ── LEFT: copy ── */}
        <div data-reveal>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">{t.badge}</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.1] text-white sm:text-4xl lg:text-5xl">
            {t.title} <span className="text-accent">{t.accent}</span>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-gray-400">{t.sub}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {/* See all photos → dedicated /gallery page */}
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-full bg-accent/90 px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-accent hover:shadow-lg hover:shadow-accent/20"
            >
              {t.all} <span aria-hidden>→</span>
            </Link>
            <a
              href="#articles"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-accent/10 hover:text-accent-light"
            >
              {t.cta} <span aria-hidden>→</span>
            </a>
          </div>
        </div>

        {/* ── RIGHT: staggered HEXAGON photo grid (highlights only) ── */}
        {highlights.length === 0 ? (
          <p data-reveal className="font-mono text-sm text-muted">
            Drop images into <code>src/assets/images/highlights/</code> — they appear here automatically.
          </p>
        ) : (
          <div
            data-reveal
            className="mx-auto grid w-full max-w-md grid-cols-3 gap-2.5 sm:gap-3 [&>*:nth-child(3n+2)]:translate-y-8"
          >
            {highlights.map((it) => (
              <figure
                key={it.id}
                title={captionOf(it)}
                className="group transition-transform duration-300 ease-out hover:scale-105 active:scale-110 hover:[filter:drop-shadow(0_0_14px_rgb(var(--accent)/0.55))]"
              >
                {/* outer hex = the (amber-on-hover) border ring */}
                <div
                  className="bg-white/10 p-[2px] transition-colors duration-300 group-hover:bg-accent/70"
                  style={{ clipPath: HEX, aspectRatio: '1 / 1.1547' }}
                >
                  {/* inner hex holds the photo + hover caption */}
                  <div className="relative h-full w-full overflow-hidden" style={{ clipPath: HEX }}>
                    <img
                      src={it.url}
                      alt={altOf(it)}
                      loading="lazy" decoding="async"
                      className="h-full w-full object-cover"
                    />
                    {/* caption on hover, clipped to the hexagon */}
                    <figcaption className="absolute inset-0 flex items-center justify-center bg-black/55 px-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="font-mono text-[10px] leading-tight text-accent-light sm:text-[11px]">
                        {captionOf(it)}
                      </span>
                    </figcaption>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
