import { useCallback, useEffect, useState } from 'react'

// ── Light / Dark theme (Tokyo Urban) ──────────────────────────────────────────
// Single source of truth: a `data-theme` attribute on <html>. The whole palette
// is driven by CSS variables (see index.css), so flipping this attribute reskins
// the site instantly. Default = the visitor's OS preference; their explicit
// choice (via the toggle) is pinned in localStorage and then wins from then on.
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'mtn_theme'

function readPinned(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* private mode / blocked storage */ }
  return null
}

export function getInitialTheme(): Theme {
  const pinned = readPinned()
  if (pinned) return pinned
  try {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  } catch { /* no matchMedia */ }
  return 'dark'
}

// Apply a theme to the document (attribute + browser UI chrome colour).
export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'light' ? '#F4F6FA' : '#08090F')
}

export interface UseThemeResult {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

export default function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  // Reflect the active theme to the DOM (does NOT persist — auto-following the OS
  // should stay un-pinned until the user makes an explicit choice).
  useEffect(() => { applyTheme(theme) }, [theme])

  // Persist only on an explicit choice, so the OS-follow logic below can tell
  // "user picked this" apart from "we're just mirroring the system".
  const pin = (t: Theme): void => { try { localStorage.setItem(STORAGE_KEY, t) } catch { /* ignore */ } }

  const setTheme = useCallback((t: Theme): void => {
    const next: Theme = t === 'light' ? 'light' : 'dark'
    pin(next); setThemeState(next)
  }, [])

  const toggle = useCallback((): void => {
    setThemeState((t) => { const next: Theme = t === 'light' ? 'dark' : 'light'; pin(next); return next })
  }, [])

  // Live-follow the OS preference — but only while the user hasn't pinned a choice.
  useEffect(() => {
    let mq: MediaQueryList
    try { mq = window.matchMedia('(prefers-color-scheme: light)') } catch { return }
    const onChange = (e: MediaQueryListEvent): void => { if (!readPinned()) setThemeState(e.matches ? 'light' : 'dark') }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return { theme, setTheme, toggle }
}
