import { useCallback, useEffect, useState } from 'react'
import type { Lang } from '../lib/vedin'

// ── Language (Burmese / English) ─────────────────────────────────────────────
// Mirrors the useTheme pattern: a single localStorage key so the choice survives
// refresh AND carries across routes. Previously Vedin, Research and Algorithms
// each owned an independent useState<Lang>('mm'), so switching to English on one
// page silently reverted when you navigated to another.
const STORAGE_KEY = 'mtn_lang'

export function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'mm' || saved === 'en') return saved
  } catch { /* private mode / blocked storage */ }
  return 'mm'
}

export default function useLang() {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* ignore */ }
    // Keep the document language in sync so screen readers and the browser pick
    // the right pronunciation/font fallback for Burmese.
    document.documentElement.setAttribute('lang', lang === 'mm' ? 'my' : 'en')
  }, [lang])

  const setLang = useCallback((l: Lang) => setLangState(l === 'en' ? 'en' : 'mm'), [])
  const toggle = useCallback(() => setLangState((l) => (l === 'mm' ? 'en' : 'mm')), [])

  return { lang, setLang, toggle }
}
