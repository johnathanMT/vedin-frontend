import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { getInitialTheme, applyTheme } from './hooks/useTheme'
import Seo from './components/Seo'
import VedinShell from './components/VedinShell'
import './index.css'

// This repository is now the standalone **Vedin** app. The old portfolio home,
// navbar, footer and all portfolio routes have been removed — the portfolio
// lives separately at https://myothant.dev.
//
// Lazy-loaded so the initial mobile bundle stays small (Vedin pulls in tz-lookup,
// Algorithms pulls in KaTeX, etc. → code-split).
const Vedin = lazy(() => import('./components/Vedin'))
const Research = lazy(() => import('./components/Research'))
const Algorithms = lazy(() => import('./components/Algorithms'))
const VedinAdmin = lazy(() => import('./components/VedinAdmin'))
const ResetPassword = lazy(() => import('./components/ResetPassword'))
const ConfirmEmail = lazy(() => import('./components/ConfirmEmail'))

const fallback = <div className="py-24 text-center font-mono text-sm text-muted">Loading…</div>

// Set the theme attribute BEFORE React paints, so there's no light/dark flash.
// (CSP blocks inline <script> in index.html, so we do it here in a module.)
applyTheme(getInitialTheme())

// basename = the deploy base (Vite's BASE_URL): '/' on the apex domain. Trailing
// slash stripped per react-router's rule. The server MUST rewrite unknown paths
// to index.html — see vercel.json.
const BASENAME = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/'

// ── Legacy hash-link shim ─────────────────────────────────────────────────────
// Old links shared as "…/#/route" are rewritten to "/route" once, before render,
// so BrowserRouter reads the corrected path.
if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  const target = base + window.location.hash.slice(1) + window.location.search
  window.history.replaceState(null, '', target)
}

// #root is guaranteed by index.html; guard keeps TS strict-null happy without `!`.
const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found in index.html')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={BASENAME}>
        <Routes>
          {/* Root = the Vedin astrology app (full screen, no portfolio layout). */}
          <Route path="/" element={<><Seo title="Vedin — Professional Vedic Astrology | Sayar Bhone Min Thike Din" path="/" description="Get your accurate Vedic astrology reading — Chandra Lagna, D1–D60 divisional charts, Vimśottarī dasha, Shadbala & Ashtakavarga." image="/vedin-logo-og.png" /><VedinShell><Suspense fallback={fallback}><Vedin /></Suspense></VedinShell></>} />

          <Route path="/research" element={<><Seo title="Vedin Research — Falsifiable Protocol" path="/research" description="A pre-registered, falsifiable protocol that measures whether Vedic astrology beats chance — honest methodology, hash-locked predictions, live statistics." noindex /><VedinShell><Suspense fallback={fallback}><Research /></Suspense></VedinShell></>} />

          <Route path="/algorithms" element={<><Seo title="Vedin Algorithms — Computational Reconstruction" path="/algorithms" description="The classical astronomical & astrological algorithms behind the charts — Julian Day, VSOP87, coordinate transforms, modular arithmetic, varga maps, dasha recursion, Ashtakavarga — with formulas and TypeScript." /><VedinShell><Suspense fallback={fallback}><Algorithms /></Suspense></VedinShell></>} />

          {/* Admin → its own full-screen layout, not indexed. */}
          <Route path="/vedin-admin" element={<><Seo title="Vedin Admin" path="/vedin-admin" noindex /><Suspense fallback={<div style={{ minHeight: '100vh', background: '#0b0e1a' }} />}><VedinAdmin /></Suspense></>} />

          {/* Auth flows (not indexed): email-confirm + auto-login, and password reset. */}
          <Route path="/confirm" element={<><Seo title="Confirm email — Vedin" path="/confirm" noindex /><Suspense fallback={fallback}><ConfirmEmail /></Suspense></>} />
          <Route path="/reset-password" element={<><Seo title="Reset password — Vedin" path="/reset-password" noindex /><Suspense fallback={fallback}><ResetPassword /></Suspense></>} />

          {/* Legacy paths → the new root. */}
          <Route path="/vedin" element={<Navigate to="/" replace />} />
          <Route path="/jyotish" element={<Navigate to="/" replace />} />
          {/* Everything else falls back to the Vedin app. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)

// Fade out and remove the instant boot splash now that React has mounted.
const bootSplash = document.getElementById('boot-splash')
if (bootSplash) {
  requestAnimationFrame(() => {
    bootSplash.classList.add('bs-hide')
    window.setTimeout(() => bootSplash.remove(), 400)
  })
}
