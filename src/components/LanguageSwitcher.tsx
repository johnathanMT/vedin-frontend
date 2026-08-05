import { useEffect, useRef, useState } from 'react'
import { Languages, Check, ChevronDown } from 'lucide-react'
import useLang, { LANG_OPTIONS } from '../hooks/useLang'

/**
 * A subtle, premium language switcher for the header — Myanmar / English / 日本語.
 * Backed by the shared useLang store, so a change here instantly reskins the whole
 * app. Fully theme-aware (slate on light, neutral on dark) with a gold-accented
 * active state; closes on outside-click or Escape.
 */
export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  const current = LANG_OPTIONS.find((o) => o.code === lang) ?? LANG_OPTIONS[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button" onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox" aria-expanded={open} aria-label="Change language"
        className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2 font-mono text-xs text-slate-700 transition-colors hover:border-amber-500/40 hover:text-amber-700 dark:border-white/15 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-amber-400/40 dark:hover:text-amber-400"
      >
        <Languages size={14} /> <span>{current.label}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul role="listbox" aria-label="Language"
          className="absolute right-0 z-50 mt-1.5 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          {LANG_OPTIONS.map((o) => (
            <li key={o.code}>
              <button
                type="button" role="option" aria-selected={o.code === lang}
                onClick={() => { setLang(o.code); setOpen(false) }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${o.code === lang
                  ? 'font-medium text-amber-700 dark:text-amber-400'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-neutral-300 dark:hover:bg-neutral-800'}`}
              >
                {o.label} {o.code === lang && <Check size={14} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
