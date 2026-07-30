import { useState, useEffect, lazy, Suspense } from 'react'
import { SITE } from './config/site'
import useTheme from './hooks/useTheme'
import AmbientBackground from './components/AmbientBackground'
import Navbar           from './components/Navbar'
import Gateway          from './components/Gateway'         // tiered-experience landing
import About            from './components/About'
import Philosophy       from './components/Philosophy'
import CyberPoetry      from './components/CyberPoetry'    // techno-science poems (datapad)
import ProjectsSection  from './components/ProjectsSection'
import TechStack        from './components/TechStack'         // Architecture & journey
import GallerySection    from './components/GallerySection'   // Memory Gallery (photos)
import SectionSkeleton  from './components/SectionSkeleton'   // lazy-load fallback
import DeferUntilVisible from './components/DeferUntilVisible' // gate heavy chunks by scroll
import VideoShowcase     from './components/VideoShowcase'     // auto-play highlight reel
import ArticlesSection  from './components/ArticlesSection'
import SeasonalGallery  from './components/SeasonalGallery'
import TravelChronicles from './components/TravelChronicles'
import Exploring        from './components/Exploring'
import AILineBot        from './components/AILineBot'      // "Talk to my AI agent" promo
import Footer           from './components/MegaFooter'   // SaaS-style mega footer
import BootScreen       from './components/BootScreen'      // "System Booting…" loader
import HudFrame         from './components/HudFrame'        // HUD corner overlay
import TechDecor        from './components/TechDecor'       // edge wireframe SVG decorations

// Lazy-loaded: pulls in three.js (~heavy), so it's code-split out of the main
// Hub bundle and only fetched when this section is rendered.
const VisitorGlobe = lazy(() => import('./components/VisitorGlobe'))

// Below-the-fold interactive sections — code-split so the initial mobile load
// stays light. They only download as the visitor scrolls toward them.
const LiveCodeShowcase = lazy(() => import('./components/LiveCodeShowcase'))
const AlgorithmLab     = lazy(() => import('./components/AlgorithmLab'))
const AgentFlow        = lazy(() => import('./components/AgentFlow'))
const QuantumLab       = lazy(() => import('./components/QuantumLab'))
const AntimatterSim    = lazy(() => import('./components/AntimatterSim'))

// ── TIERED EXPERIENCE GATEWAY ────────────────────────────────────────────────
// This is the lightweight HUB domain: NO heavy three.js here, so it stays fast on
// low-end devices. The full WebGL scene (London / Pagoda / Osaka) is a separate
// build served from the immersive subdomain, reached via the Gateway button.
// The hub's "stunning but cheap" backdrop is the CSS galaxy + ambient layer.

export default function App() {
  const [lang, setLang] = useState<string>(() => {
    try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' }
  })

  // Light / dark theme — drives the `data-theme` attribute on <html>.
  const { theme, toggle: toggleTheme } = useTheme()

  useEffect(() => {
    try { localStorage.setItem('mtn_lang', lang) } catch { /* ignore */ }
  }, [lang])

  // Warm-up ping: wake the Render free-tier backend on page load so it's up by
  // the time the visitor reaches the globe. A normal CORS fetch is used (our
  // origin is whitelisted in the backend's CORS policy). NOTE: 'no-cors' is
  // wrong here — the API sends `Cross-Origin-Resource-Policy: same-site`, which
  // the browser enforces against no-cors cross-origin loads and cancels them.
  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`${SITE.apiUrl}/health`, { cache: 'no-store' }).catch(() => {})
    }, 0)
    return () => clearTimeout(t)
  }, [])

  return (
    // Content sits at z-10; the lightweight background layers at z-0.
    <div className="theme-batman relative min-h-screen bg-space text-white overflow-x-hidden">
      {/* Lightweight, GPU-friendly backdrop (no WebGL): Milky-Way gradient + stars. */}
      <div className="orbit-galaxy fixed inset-0 z-0" aria-hidden />
      <AmbientBackground />
      {/* Abstract high-tech edge decorations (desktop only, behind content) */}
      <TechDecor />

      <Navbar lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} />
      <main className="relative z-10">
        {/* Tiered-experience landing (neon name + Lite / Immersive choice) */}
        <Gateway />

        <About            lang={lang} />
        <Philosophy />
        <CyberPoetry />
        <ProjectsSection  lang={lang} />
        <TechStack        lang={lang} />
        {/* Each heavy section is its OWN lazy chunk + Suspense, so they download
            and reveal independently as the visitor scrolls (not all-or-nothing). */}
        <Suspense fallback={<SectionSkeleton label="Live code" />}><LiveCodeShowcase /></Suspense>
        <Suspense fallback={<SectionSkeleton label="Algorithm Lab" />}><AlgorithmLab /></Suspense>
        <Suspense fallback={<SectionSkeleton label="Agentic AI" />}><AgentFlow /></Suspense>
        <Suspense fallback={<SectionSkeleton label="Quantum Lab" />}><QuantumLab /></Suspense>
        <Suspense fallback={<SectionSkeleton label="Antimatter" />}><AntimatterSim /></Suspense>
        <GallerySection   lang={lang} />
        <VideoShowcase    lang={lang} />
        {/* Heaviest chunk on the page (~1.4 MB three.js). Deferred until the
            visitor scrolls near it, so it never touches the initial mobile load. */}
        <DeferUntilVisible minHeight={520} fallback={<div className="py-24 text-center font-mono text-sm text-muted">Loading globe…</div>}>
          <Suspense fallback={<div className="py-24 text-center font-mono text-sm text-muted">Loading globe…</div>}>
            <VisitorGlobe   lang={lang} />
          </Suspense>
        </DeferUntilVisible>
        <ArticlesSection />
        <SeasonalGallery lang={lang} />
        <TravelChronicles lang={lang} setLang={setLang} />
        <Exploring />
        <AILineBot        lang={lang} />
      </main>
      <div className="relative z-10"><Footer lang={lang} /></div>

      {/* ── Elite cyberpunk overlays (fixed, above everything) ── */}
      <HudFrame />
      <BootScreen />
    </div>
  )
}
