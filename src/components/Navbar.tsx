import { useState, useEffect, Fragment, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { PERSONAL } from '../data/content'
import ThemeToggle from './ThemeToggle'
import type { Theme } from '../hooks/useTheme'

interface LangOption { code: string; flag: string }
const LANGS: LangOption[] = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'mm', flag: '🇲🇲' },
  { code: 'jp', flag: '🇯🇵' },
  { code: 'vn', flag: '🇻🇳' },
  { code: 'ne', flag: '🇳🇵' },
  { code: 'id', flag: '🇮🇩' },
  { code: 'zh', flag: '🇨🇳' },
]

const isGitHub = window.location.hostname.includes('github.io')
const blogPath = isGitHub ? '/Myweb/blog.html' : '/blog.html'

interface NavLink {
  key: string
  href?: string
  route?: string
  isExternal?: boolean
}

const NAV_LINKS: NavLink[] = [
  { href: '#home', key: 'home' },
  { href: '#about', key: 'about' },
  { href: '#projects', key: 'projects' },
  { href: '#stack', key: 'stack' },
  { href: '#gallery', key: 'gallery' },
  { href: '#exploring', key: 'exploring' },
  { route: '/vedin', key: 'vedin' },          // Vedic astrology calculator
  { route: '/sanctuary', key: 'sanctuary' },     // dedicated route (#/sanctuary)
  { href: blogPath, key: 'blog', isExternal: true },
]

// The four interactive CS sections, grouped under one "Techno Science Lab" menu.
const LAB_LINKS: NavLink[] = [
  { href: '#lab', key: 'lab' },              // Algorithm Lab (sorting / A* / Dijkstra / BST)
  { href: '#agent', key: 'agent' },          // Agentic-AI workflow
  { href: '#quantum', key: 'quantum' },      // 2-qubit circuit
  { href: '#antimatter', key: 'antimatter' },// annihilation sim
]
const LAB_KEYS = LAB_LINKS.map((l) => l.key)

// i18n labels for the nav (falls back to `en` for any missing language).
const NAV_T: Record<string, Record<string, string>> = {
  en: { home: 'Home',      about: 'About',      projects: 'Projects',      stack: 'Stack',     labMenu: 'Techno Science Lab', lab: 'Lab',     agent: 'AI',  quantum: 'Quantum',   antimatter: 'Antimatter',  gallery: 'Gallery',  exploring: 'Exploring', vedin: 'Vedin', sanctuary: 'Sanctuary', blog: 'Blog' },
  mm: { home: 'ပင်မ',       about: 'အကြောင်း',     projects: 'ပရောဂျက်များ',    stack: 'နည်းပညာ',   labMenu: 'Techno Science Lab', lab: 'Lab',     agent: 'AI',  quantum: 'ကွမ်တမ်',    antimatter: 'Antimatter',  gallery: 'ပြခန်း',    exploring: 'လေ့လာရန်',  vedin: 'ဗေဒင်', sanctuary: 'အောက်မေ့ပင်', blog: 'ဘလော့' },
  jp: { home: 'ホーム',     about: '概要',        projects: 'プロジェクト',    stack: 'スタック',  labMenu: 'テクノサイエンス', lab: 'Lab',     agent: 'AI',  quantum: '量子',      antimatter: '反物質',      gallery: 'ギャラリー', exploring: '探索',      sanctuary: '記憶の木',   blog: 'ブログ' },
  vn: { home: 'Trang chủ', about: 'Giới thiệu', projects: 'Dự án',         stack: 'Công nghệ', labMenu: 'Techno Science Lab', lab: 'Lab',     agent: 'AI',  quantum: 'Lượng tử',  antimatter: 'Phản vật chất', gallery: 'Thư viện', exploring: 'Khám phá',  sanctuary: 'Cây Kỷ Niệm', blog: 'Blog' },
  ne: { home: 'गृह',        about: 'परिचय',       projects: 'परियोजना',       stack: 'स्ट्याक',    labMenu: 'Techno Science Lab', lab: 'Lab',     agent: 'AI',  quantum: 'क्वान्टम',  antimatter: 'प्रतिपदार्थ',   gallery: 'ग्यालरी',   exploring: 'अन्वेषण',    sanctuary: 'सम्झना रूख', blog: 'ब्लग' },
  id: { home: 'Beranda',   about: 'Tentang',    projects: 'Proyek',        stack: 'Teknologi', labMenu: 'Techno Science Lab', lab: 'Lab',     agent: 'AI',  quantum: 'Kuantum',   antimatter: 'Antimateri',  gallery: 'Galeri',   exploring: 'Jelajahi',  sanctuary: 'Pohon Kenangan', blog: 'Blog' },
  zh: { home: '首页',       about: '关于',        projects: '项目',          stack: '技术栈',     labMenu: '科技实验室', lab: 'Lab',     agent: 'AI',  quantum: '量子',      antimatter: '反物质',      gallery: '画廊',      exploring: '探索',      sanctuary: '记忆之树',   blog: '博客' },
}

interface NavbarProps {
  lang: string
  setLang: (lang: string) => void
  theme: Theme
  toggleTheme: () => void
}

export default function Navbar({ lang, setLang, theme, toggleTheme }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [labOpen, setLabOpen] = useState(false)   // "Techno Science Lab" dropdown
  const [activeSection, setActiveSection] = useState('home')
  const t = NAV_T[lang] || NAV_T.en   // translated nav labels

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const sections = ['home', 'about', 'projects', 'stack', 'lab', 'agent', 'quantum', 'antimatter', 'gallery', 'seasonal', 'exploring']
    let ticking = false
    let lastScrolled = false
    let lastActive = 'home'

    // rAF-throttled: do at most one layout read+update per animation frame, and
    // only call setState when a value actually changes → no scroll-time jank.
    const update = () => {
      ticking = false
      const y = window.scrollY
      const isScrolled = y > 40
      if (isScrolled !== lastScrolled) { lastScrolled = isScrolled; setScrolled(isScrolled) }
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && y >= el.offsetTop - 120) {
          if (id !== lastActive) { lastActive = id; setActiveSection(id) }
          break
        }
      }
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()   // set initial state
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Smooth-scroll to an element id, retrying briefly while the Home page mounts
  // (sections aren't in the DOM the instant we navigate from another route).
  const scrollToId = (id: string, tries = 25) => {
    const el = document.getElementById(id)
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
    if (tries > 0) setTimeout(() => scrollToId(id, tries - 1), 80)
  }

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  // Core cross-page navigation:
  //  • on Home ('/')    → scroll right now.
  //  • on another route → navigate('/'), then scroll once Home has mounted.
  //  • 'home' link      → always scroll to the very top.
  const goToSection = (id: string) => {
    const onHome = location.pathname === '/'
    if (id === 'home') {
      if (onHome) scrollTop()
      else { navigate('/'); setTimeout(scrollTop, 120) }
      return
    }
    if (onHome) scrollToId(id)
    else { navigate('/'); setTimeout(() => scrollToId(id), 120) }
  }

  // Unified click handler for nav items:
  //  • isExternal (blog)  → let the browser follow the real link.
  //  • route (/sanctuary) → client-side navigate to that route.
  //  • href (#section)    → cross-page smooth-scroll to the section.
  const handleNav = (e: MouseEvent<HTMLAnchorElement>, item: NavLink) => {
    if (item.isExternal) return
    e.preventDefault()
    setMenuOpen(false)
    if (item.route) { navigate(item.route); return }
    if (item.href) goToSection(item.href.replace(/^#/, ''))
  }

  // Logo → Home + smooth-scroll to the very top (works from any route).
  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setMenuOpen(false)
    if (location.pathname === '/') scrollTop()
    else { navigate('/'); setTimeout(scrollTop, 120) }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-space/90 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/20'
        : 'bg-transparent'
        }`}
    >
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo → Home (smooth scroll to top) */}
        <a
          href="/"
          onClick={goHome}
          aria-label="Back to top / Home"
          className="flex items-center gap-2 font-mono font-semibold text-white hover:text-accent-light transition-colors cursor-pointer"
        >
          <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-xs font-groovy text-white">M</span>
          <span className="hidden sm:inline text-sm font-groovy tracking-wide">{PERSONAL.handle}</span>
        </a>

        {/* Desktop nav links — now appear at lg (>=1024px) */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((item) => {
            const { key, href, route, isExternal = false } = item
            const isActive = route
              ? location.pathname === route
              : (activeSection === href?.slice(1) && !isExternal && location.pathname === '/')
            return (
              <Fragment key={key}>
                <li>
                  <a
                    href={route ? `#${route}` : href}
                    onClick={(e) => handleNav(e, item)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-medium font-groovy tracking-wide transition-all duration-200 ${isActive
                      ? 'text-white bg-accent/20 neon-glow'
                      : 'text-muted hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {t[key] ?? NAV_T.en[key]}
                  </a>
                </li>

                {/* ── Techno Science Lab dropdown (right after Stack) ── */}
                {key === 'stack' && (
                  <li className="relative"
                    onMouseEnter={() => setLabOpen(true)}
                    onMouseLeave={() => setLabOpen(false)}>
                    <button
                      type="button"
                      onClick={() => setLabOpen((o) => !o)}
                      aria-haspopup="true"
                      aria-expanded={labOpen}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium font-groovy tracking-wide transition-all duration-200 ${
                        (LAB_KEYS.includes(activeSection) && location.pathname === '/')
                          ? 'text-white bg-accent/20 neon-glow'
                          : 'text-muted hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {t.labMenu}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${labOpen ? 'rotate-180 text-jade-light' : ''}`} />
                    </button>

                    {/* glassmorphism panel */}
                    <div
                      className={`absolute left-0 top-full mt-2 w-56 rounded-xl border border-jade/25 bg-space/95 p-1.5 backdrop-blur-xl transition-all duration-200 ${
                        labOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
                      }`}
                      style={{ boxShadow: '0 0 0 1px rgb(var(--jade) / 0.12), 0 18px 50px -14px rgba(0,0,0,0.85)' }}
                    >
                      <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-wider text-jade/70">// lab modules</p>
                      {LAB_LINKS.map((sub) => {
                        const subActive = activeSection === sub.key && location.pathname === '/'
                        return (
                          <a
                            key={sub.key}
                            href={sub.href}
                            onClick={(e) => { handleNav(e, sub); setLabOpen(false) }}
                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs transition-colors ${
                              subActive ? 'bg-accent/20 text-accent-light' : 'text-muted hover:bg-jade/10 hover:text-jade-light'
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-jade/60" /> {t[sub.key]}
                          </a>
                        )
                      })}
                    </div>
                  </li>
                )}
              </Fragment>
            )
          })}
        </ul>

        {/* Right group: lang switcher (desktop only) + hamburger */}
        <div className="flex items-center gap-3">
          {/* Flags now match the nav-links breakpoint: hidden until lg.
              On smaller screens the flags live in the mobile menu below. */}
          <div className="hidden lg:flex items-center gap-0.5 bg-white/5 rounded-xl p-1">
            {LANGS.map(({ code, flag }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                title={code.toUpperCase()}
                className={`w-8 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${lang === code ? 'bg-accent/70 shadow-sm' : 'hover:bg-white/10 opacity-60 hover:opacity-100'
                  }`}
              >
                {flag}
              </button>
            ))}
          </div>

          {/* Light / dark toggle */}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          {/* Hamburger — visible below lg */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-base`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu — visible below lg; holds BOTH links and flags.
          Open: expands up to 85vh and scrolls if the content (links + 7 flags)
          is taller, so the language switcher is always fully reachable.
          Closed: collapses to 0 with overflow hidden for the slide animation. */}
      <div
        className={`lg:hidden transition-all duration-300 bg-surface/95 backdrop-blur-md border-b border-white/5 ${menuOpen
          ? 'max-h-[85vh] overflow-y-auto overscroll-contain opacity-100'
          : 'max-h-0 overflow-hidden opacity-0'
          }`}
      >
        <ul
          className="px-6 pt-4 flex flex-col gap-1"
          style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        >
          {NAV_LINKS.map((item) => (
            <Fragment key={item.key}>
              <li>
                <a
                  href={item.route ? `#${item.route}` : item.href}
                  onClick={(e) => handleNav(e, item)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-medium font-groovy tracking-wide text-muted hover:text-white hover:bg-white/5 transition-all"
                >
                  {t[item.key] ?? NAV_T.en[item.key]}
                </a>
              </li>

              {/* Techno Science Lab — grouped sub-links (after Stack) */}
              {item.key === 'stack' && (
                <li className="my-1 rounded-xl border border-jade/15 bg-jade/[0.04] p-1">
                  <p className="px-4 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-wider text-jade/70">{t.labMenu}</p>
                  {LAB_LINKS.map((sub) => (
                    <a
                      key={sub.key}
                      href={sub.href}
                      onClick={(e) => handleNav(e, sub)}
                      className="flex items-center gap-2.5 rounded-lg px-4 py-2 font-mono text-xs text-muted transition-colors hover:bg-jade/10 hover:text-jade-light"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-jade/60" /> {t[sub.key]}
                    </a>
                  ))}
                </li>
              )}
            </Fragment>
          ))}

          {/* Language flags inside the mobile menu */}
          <li className="pt-3 border-t border-white/5 mt-2">
            <p className="px-4 pb-2 text-xs font-mono text-muted">Language</p>
            <div className="flex items-center gap-1.5 flex-wrap px-4">
              {LANGS.map(({ code, flag }) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setMenuOpen(false) }}
                  title={code.toUpperCase()}
                  className={`w-10 h-9 rounded-lg text-base transition-all ${lang === code ? 'bg-accent/70' : 'bg-white/5 opacity-70 hover:opacity-100'
                    }`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </li>
        </ul>
      </div>
    </header>
  )
}
