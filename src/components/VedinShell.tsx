import { type ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import useTheme from '../hooks/useTheme'
import AmbientBackground from './AmbientBackground'
import ThemeToggle from './ThemeToggle'
import Footer from './Footer'
import LanguageSwitcher from './LanguageSwitcher'

/**
 * VedinShell — the standalone layout for the decoupled Vedin app.
 *
 * Replaces the old portfolio `PageShell`: there is NO portfolio Navbar, NO
 * MegaFooter, and NO internal "back to portfolio" React-Router links. It only
 * provides:
 *   • the ambient background glow (pure CSS, lightweight),
 *   • a minimal top bar with the light/dark ThemeToggle (which used to live in
 *     the portfolio Navbar) and a single EXTERNAL link out to the portfolio.
 *
 * The page itself (Vedin / Research / Algorithms) still carries its own
 * `.vedin-page` scope + `section-container`, so theming is unchanged.
 */
export default function VedinShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme()
  return (
    <div className="relative min-h-screen overflow-x-hidden text-fg" style={{ background: 'rgb(var(--space))' }}>
      <AmbientBackground />

      <header
        className="relative z-20 mx-auto flex max-w-6xl items-center justify-end gap-2 px-4 sm:px-6"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
      >
        {/* Link to the separate portfolio site — same-tab navigation (no new window). */}
        <a
          href="https://myothant.dev"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent-light"
        >
          Portfolio <ExternalLink size={13} aria-hidden />
        </a>
        <LanguageSwitcher />
        <ThemeToggle theme={theme} onToggle={toggle} />
      </header>

      <main
        className="relative z-10"
        style={{ paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}
      >
        {children}
      </main>

      <Footer />
    </div>
  )
}
