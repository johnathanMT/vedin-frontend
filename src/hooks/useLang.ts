import { useCallback, useSyncExternalStore } from 'react'
import type { Lang } from '../lib/vedin'

// ── Language (Myanmar / English / Japanese) ──────────────────────────────────
// A single module-level store (not per-component useState) so switching the
// language in ONE place — e.g. the header switcher — instantly re-renders every
// consumer across the app, and the choice survives refresh + carries across routes.
const STORAGE_KEY = 'mtn_lang'
const LANGS: readonly Lang[] = ['mm', 'en', 'ja']

function read(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'mm' || saved === 'en' || saved === 'ja') return saved
  } catch { /* private mode / blocked storage */ }
  return 'mm'
}

let current: Lang = read()
const listeners = new Set<() => void>()

function applyDocLang(l: Lang) {
  // Keep <html lang> in sync for screen readers / font fallback (my / en / ja).
  try { document.documentElement.setAttribute('lang', l === 'mm' ? 'my' : l) } catch { /* SSR */ }
}
applyDocLang(current)

function commit(l: Lang) {
  current = l
  try { localStorage.setItem(STORAGE_KEY, l) } catch { /* ignore */ }
  applyDocLang(l)
  listeners.forEach((fn) => fn())
}

// Cross-tab: mirror a change made in another tab.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) { current = read(); applyDocLang(current); listeners.forEach((fn) => fn()) }
  })
}

export function getInitialLang(): Lang { return current }

export default function useLang() {
  const lang = useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb) } },
    () => current,
    () => current,
  )

  const setLang = useCallback((l: Lang) => { commit(LANGS.includes(l) ? l : 'mm') }, [])
  // Cycles mm → en → ja → mm — kept for any legacy caller that still uses toggle().
  const toggle = useCallback(() => {
    commit(current === 'mm' ? 'en' : current === 'en' ? 'ja' : 'mm')
  }, [])

  return { lang, setLang, toggle }
}

export const LANG_OPTIONS: { code: Lang; label: string }[] = [
  { code: 'mm', label: 'မြန်မာ' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
]
