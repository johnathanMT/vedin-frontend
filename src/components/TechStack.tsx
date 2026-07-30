import { useCyberReveal } from '../hooks/useCyberReveal'
import { Database, ShieldCheck, type LucideIcon } from 'lucide-react'
// Authentic CC0 brand icons, bundled locally from the `simple-icons` npm package
// → ZERO external CDN. Tree-shaken: only these 11 icons ship in the bundle.
import {
  siReact, siVite, siTailwindcss, siThreedotjs, siFramer, siGreensock,
  siDotnet, siMysql, siCloudinary, siVercel, siRender,
  type SimpleIcon,
} from 'simple-icons'

/**
 * TechStack — "Architecture & Journey" section (Batman theme).
 *  Left  : professional narrative (transition into IT / software engineering in JP).
 *  Right : the real senior-level stack in glassmorphism category cards, gold accents.
 *  Data-driven: edit STACK / T below — no JSX surgery needed. Theme-token colours
 *  (text-accent etc.) so it follows .theme-batman automatically.
 */

const GOLD = '#c9a13b'

// ── LOGO MAPPING (single source of truth, 100% local) ───────────────────────
// name → simple-icons icon object ({ path, hex, title }). No network, no CDN.
const techLogos: Record<string, SimpleIcon> = {
  'React': siReact,
  'Vite': siVite,
  'Tailwind CSS': siTailwindcss,
  'Three.js': siThreedotjs,
  'Framer Motion': siFramer,
  'GSAP': siGreensock,
  'C# / .NET 8': siDotnet,
  'MySQL · Aiven': siMysql,
  'Cloudinary': siCloudinary,
  'Vercel': siVercel,
  'Render': siRender,
}

// Use the official brand colour, except near-black marks (three.js / vercel /
// render = #000000) which we tint gold so they're visible on the dark theme.
const tintFor = (icon: SimpleIcon): string => (icon.hex === '000000' ? GOLD : `#${icon.hex}`)

// Each item is just a name (→ looked up in techLogos) or a lucide `icon`.
interface StackItem { name: string; icon?: LucideIcon }
interface StackGroup { group: string; items: StackItem[] }

const STACK: StackGroup[] = [
  {
    group: 'Frontend',
    items: [
      { name: 'React' }, { name: 'Vite' }, { name: 'Tailwind CSS' },
      { name: 'Three.js' }, { name: 'Framer Motion' }, { name: 'GSAP' },
    ],
  },
  {
    group: 'Backend & API',
    items: [
      { name: 'C# / .NET 8' },
      { name: 'EF Core', icon: Database },            // no brand logo → lucide icon
      { name: 'JWT Auth', icon: ShieldCheck },
    ],
  },
  {
    group: 'Data & Cloud',
    items: [
      { name: 'MySQL · Aiven' }, { name: 'Cloudinary' },
      { name: 'Vercel' }, { name: 'Render' },
    ],
  },
]

// i18n. Only `en` is fully written; other languages fall back to en per key.
interface StackText {
  badge: string
  title: string
  accent: string
  intro: string
  paras: string[]
  chips: string[]
  stackHead: string
}

const EN: StackText = {
  badge: 'ARCHITECTURE & JOURNEY',
  title: 'AI Engineering my way',
  accent: 'from care to code',
  intro: '',
  paras: ['International Relations graduate turned Software Engineer. By day, I support those in need as a care worker; by night, I’m deep-diving into CS and building Agentic AI systems. I bring human-centric perspective to every line of code I write.',
    'That path shaped how I build: patient, detail-driven, and focused on people. I taught myself to ship full-stack systems end-to-end — from database schema to deployed UI.',
    'My core strength is robust backend engineering with C# / .NET 8 (REST APIs, EF Core, JWT auth, rate limiting), paired with a modern React + Vite + Tailwind frontend and 3D WebGL experiences.',
    'Everything here runs on a decoupled, security-hardened architecture: a Vercel-hosted frontend talking to a .NET API on Render, backed by Aiven MySQL and Cloudinary media.',
  ],
  chips: ['C# / .NET 8', 'React', 'Distributed Systems', 'Security', 'AI'],
  stackHead: 'The Stack',
}

const T: Record<string, Partial<StackText>> = {
  en: EN,
  mm: { badge: 'ဗိသုကာနှင့် ခရီး', title: 'ပြုစုခြင်းမှ', accent: 'ကုဒ်ရေးခြင်းဆီ', stackHead: 'နည်းပညာများ' },
  jp: { badge: 'アーキテクチャと歩み', title: 'ケアからコードへ', accent: '私の道のり', stackHead: '技術スタック' },
  zh: { badge: '架构与历程', title: '从护理', accent: '到代码', stackHead: '技术栈' },
}

// First alphanumeric character → monogram fallback (e.g. "C# / .NET 8" → "C").
const monogram = (name: string): string => (name.match(/[A-Za-z0-9]/)?.[0] || '?').toUpperCase()

// Inline SVG built from the bundled icon's path data — always renders, can never
// 404 or be rate-limited (it's part of the JS bundle, not a network request).
function BrandIcon({ icon }: { icon: SimpleIcon }) {
  return (
    <svg role="img" aria-label={`${icon.title} logo`} viewBox="0 0 24 24" className="h-7 w-7" fill={tintFor(icon)}>
      <path d={icon.path} />
    </svg>
  )
}

function LogoTile({ item }: { item: StackItem }) {
  const Icon = item.icon
  const brand = techLogos[item.name]        // bundled simple-icons object (or undefined)
  return (
    <div className="group flex flex-col items-center gap-2 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-accent/50 group-hover:shadow-[0_0_20px_-4px_rgb(var(--accent)/0.6)]">
        {Icon ? (
          <Icon size={26} className="text-accent" />
        ) : brand ? (
          <BrandIcon icon={brand} />
        ) : (
          <span className="font-mono text-lg font-bold text-accent">{monogram(item.name)}</span>
        )}
      </div>
      <span className="text-[11px] font-medium leading-tight text-gray-300">{item.name}</span>
    </div>
  )
}

interface TechStackProps { lang?: string }

export default function TechStack({ lang = 'en' }: TechStackProps) {
  const t: StackText = { ...EN, ...(T[lang] || {}) }   // fall back to en per missing key
  const ref = useCyberReveal()

  return (
    <section id="stack" ref={ref} className="relative overflow-hidden py-24 text-legible">
      {/* calm gold + maroon ambient glows */}
      <div className="pointer-events-none absolute -top-10 left-1/4 h-80 w-80 rounded-full bg-accent/8 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-maroon/25 blur-[150px]" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-start gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        {/* ── LEFT: journey narrative ── */}
        <div data-reveal>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">// {t.badge}</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.15] text-white sm:text-4xl">
            {t.title} <span className="text-accent">{t.accent}</span>
          </h2>

          <p className="mt-6 text-lg leading-relaxed text-gray-200">{t.intro}</p>
          {t.paras.map((p, i) => (
            <p key={i} className="mt-4 leading-relaxed text-gray-400">{p}</p>
          ))}

          <div className="mt-7 flex flex-wrap gap-2">
            {t.chips.map((c) => (
              <span key={c} className="rounded-full border border-accent/25 bg-accent/5 px-3 py-1 font-mono text-xs text-accent-light">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT: tech-stack category cards ── */}
        <div data-reveal className="space-y-5">
          <h3 className="font-mono text-sm uppercase tracking-[0.25em] text-gray-400">{t.stackHead}</h3>
          {STACK.map((cat) => (
            <div
              key={cat.group}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl"
            >
              {/* gold top sheen */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <p className="mb-4 text-sm font-semibold text-accent-light">{cat.group}</p>
              <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4">
                {cat.items.map((it) => <LogoTile key={it.name} item={it} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
