import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useTheme from '../hooks/useTheme'
import type { JourneyPage } from '../data/journeyHub'
import AmbientBackground from './AmbientBackground'
import JourneyHubNav from './JourneyHubNav'
import Navbar from './Navbar'
import Footer from './MegaFooter'

/**
 * PageShell — shared layout for all routed sub-pages (/python, /studying, /bibliography, …).
 *
 * Architecture notes:
 * • Background uses the theme CSS variable (--space) via Tailwind's bg-[rgb(var(--space))]
 *   so it inherits light-mode overrides automatically.
 * • Safe-area-inset padding is applied on the inner container so content clears
 *   iPhone notch and Android display cutouts on both axes.
 * • The main element uses pt-[calc(theme(spacing.24)+env(safe-area-inset-top))] to clear
 *   both the fixed navbar (96px / 6rem) and the device safe area.
 * • overflow-x:hidden on the root prevents horizontal scroll from absolutely-positioned
 *   decorative elements in child sections.
 * • z-index stack: AmbientBackground (0) → main content (10) → Navbar (50).
 *
 * Pass `journeyHub` to show cross-navigation between Bibliography, Studying, Python.
 */
export default function PageShell({
  children,
  journeyHub,
}: {
  children: ReactNode
  journeyHub?: JourneyPage
}) {
  const [lang, setLang] = useState<string>(() => {
    try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' }
  })
  const { theme, toggle: toggleTheme } = useTheme()
  useEffect(() => {
    try { localStorage.setItem('mtn_lang', lang) } catch { /* sandboxed context */ }
  }, [lang])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])

  return (
    <div
      className="relative min-h-screen overflow-x-hidden text-fg"
      style={{ background: 'rgb(var(--space, 14 20 17))' }}
    >
      <AmbientBackground />

      <Navbar lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} />

      <main
        className="relative z-10"
        style={{
          // Clear fixed navbar (96px) + device notch safe area
          paddingTop: 'calc(6rem + env(safe-area-inset-top, 0px))',
          // Prevent content from touching screen edge on curved-screen devices
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {/* Back link + optional Journey hub nav */}
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:bg-white/[0.04] hover:text-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light/60"
          >
            <ArrowLeft size={15} aria-hidden />
            <span>Back to home</span>
          </Link>
        </div>

        {journeyHub && (
          <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
            <JourneyHubNav active={journeyHub} />
          </div>
        )}

        {children}
      </main>

      {/* Footer: extra bottom padding for home-indicator on iPhones */}
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <Footer />
      </div>
    </div>
  )
}
