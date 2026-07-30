import type { ReactNode } from 'react'
import { footerData, techStack, techLogo } from '../data/footerData'

// ============================================================================
//  MegaFooter — SaaS-style mega footer, blended with the project's
//  Dark Glassmorphism + PCB / Copper / forest-dark theme.
//
//  All content is data-driven from ../data/footerData.js (brand, socials, link
//  columns, certifications, tech stack). This file is pure presentation.
// ============================================================================

// i18n for footer labels (column titles + section labels). Falls back to en.
const FT: Record<string, Record<string, string>> = {
  en: { Product: 'Product', Solutions: 'Solutions', Company: 'Company', Connect: 'Connect', powered: 'Powered by', status: 'System Operational', rights: 'All rights reserved.' },
  zh: { Product: '产品', Solutions: '解决方案', Company: '公司', Connect: '联系', powered: '技术驱动', status: '系统运行正常', rights: '版权所有。' },
  mm: { Product: 'ထုတ်ကုန်', Solutions: 'ဖြေရှင်းချက်', Company: 'ကုမ္ပဏီ', Connect: 'ဆက်သွယ်ရန်', powered: 'အားဖြည့်သည်', status: 'စနစ် ပုံမှန်အလုပ်လုပ်နေသည်', rights: 'မူပိုင်ခွင့်အားလုံး။' },
  jp: { Product: '製品', Solutions: 'ソリューション', Company: '会社', Connect: '連絡', powered: '使用技術', status: 'システム稼働中', rights: '無断転載禁止。' },
}

// Shape of a footer link (footerData is still JS; this mirrors it).
interface FooterLinkData { href: string; label: string; external?: boolean; icon?: ReactNode }

// Anchor that auto-handles internal (#hash) vs external (new tab) links.
function FooterLink({ link }: { link: FooterLinkData }) {
  const ext = link.external
  return (
    <a
      href={link.href}
      {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors duration-200 hover:text-accent-light"
    >
      {link.icon && <span aria-hidden>{link.icon}</span>}
      {link.label}
    </a>
  )
}

export default function MegaFooter({ lang = 'en' }: { lang?: string }) {
  const { brand, socials, columns, certifications } = footerData
  const year = new Date().getFullYear()
  const ft = { ...FT.en, ...(FT[lang] || {}) }   // labels, en fallback per key
  const tr = (s: string) => ft[s] || s            // translate a known label (else passthrough)

  return (
    <footer className="relative z-10 overflow-hidden border-t border-maroon/40 bg-space text-gray-400">
      {/* ── THEME LAYERS (calm — no PCB dots/traces) ── */}
      {/* gold hairline accent along the very top */}
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
      {/* smooth maroon + gold ambient glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 18% 0%, rgb(var(--maroon)/0.40), transparent 70%),' +
            'radial-gradient(45% 50% at 85% 8%, rgb(var(--accent)/0.10), transparent 70%),' +
            'radial-gradient(50% 60% at 50% 115%, rgb(var(--maroon-deep)/0.35), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
        {/* ── TOP: brand (left) + link columns (right) ── */}
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr] lg:gap-20">
          {/* LEFT */}
          <div>
            <a href="#home" className="font-mono text-2xl font-bold text-white">
              {brand.name}
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">{brand.tagline}</p>

            <div className="mt-7 flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent-light"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            {/* System Operational status badge */}
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-xs text-emerald-300">{ft.status}</span>
            </div>
          </div>

          {/* RIGHT: 4-column link grid */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="mb-4 text-sm font-semibold text-white">{tr(col.title)}</h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}><FooterLink link={link} /></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* ── POWERED BY: glassmorphism tech-stack showcase ── */}
        <div className="mt-20">
          <p className="text-center font-mono text-xs uppercase tracking-[0.35em] text-accent/80">
            ⚡ {ft.powered}
          </p>
          <div className="mx-auto mt-7 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_25px_70px_-35px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-8">
            {/* copper top sheen on the glass panel */}
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
              {techStack.map((tech) => (
                <li key={tech.name} className="group flex flex-col items-center gap-2.5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-accent/50 group-hover:shadow-[0_0_20px_-4px_rgb(var(--accent)/0.6)]">
                    <img src={techLogo(tech)} alt={`${tech.name} logo`} loading="lazy" decoding="async" className="h-7 w-7" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-medium text-gray-200">{tech.name}</p>
                    <p className="font-mono text-[10px] text-gray-500">{tech.caption}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── BOTTOM: certifications (left) + copyright (right) ── */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <div className="flex items-center gap-4">
            {certifications.map((cert) => (
              <img
                key={cert.label}
                src={cert.src}
                alt={cert.label}
                title={cert.label}
                className="h-10 w-auto opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
              />
            ))}
          </div>

          <p className="text-center text-xs text-gray-500 sm:text-right">
            © {year} {brand.name}. {ft.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
