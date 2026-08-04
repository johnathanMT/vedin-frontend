import { useCallback, useEffect, useRef, useState } from 'react'
import type { GeoResult } from '../lib/vedin-content'

const GEO_URL = 'https://nominatim.openstreetmap.org/search'
const DEBOUNCE_MS = 450
const MIN_QUERY = 3

export interface ResolvedPlace {
  label: string
  lat: number
  lon: number
  /** IANA zone derived from the coordinates; null when tz-lookup can't resolve. */
  tz: string | null
}

/**
 * Birth-place search against OpenStreetMap Nominatim, with the timezone derived
 * from the chosen coordinates. Single source of truth for this UX — it used to be
 * duplicated verbatim in Vedin.tsx and CustomerPanel.tsx.
 *
 * `confirmed` is the important bit of state: it goes false the moment the user
 * types, and only becomes true when they pick a result (or a preset). Callers
 * gate submission on it so a half-typed city can never be silently geocoded to
 * the wrong coordinates.
 */
export default function useGeocode(onResolved?: (p: ResolvedPlace) => void) {
  const [place, setPlace] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [results, setResults] = useState<GeoResult[]>([])
  const [searching, setSearching] = useState(false)
  // Nominatim being down previously looked identical to "no such city" because the
  // failure was swallowed. Surface it so the UI can say what actually happened.
  const [error, setError] = useState('')

  const timer = useRef<number | undefined>(undefined)
  const resolvedRef = useRef(onResolved)
  resolvedRef.current = onResolved

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const search = useCallback((value: string) => {
    setPlace(value)
    setConfirmed(false)   // typing invalidates a previous pick
    setError('')
    window.clearTimeout(timer.current)
    if (value.trim().length < MIN_QUERY) { setResults([]); return }
    timer.current = window.setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(`${GEO_URL}?format=json&limit=5&q=${encodeURIComponent(value)}`, {
          headers: { Accept: 'application/json' },
        })
        if (!r.ok) throw new Error(`Search failed (${r.status})`)
        const j = (await r.json()) as GeoResult[]
        setResults(Array.isArray(j) ? j : [])
      } catch {
        setResults([])
        setError('lookup-failed')
      } finally { setSearching(false) }
    }, DEBOUNCE_MS)
  }, [])

  const select = useCallback(async (g: GeoResult) => {
    const lat = Number(g.lat), lon = Number(g.lon)
    // Nominatim's display_name is a long postal chain; the first two segments are
    // the recognisable "City, Region" part.
    const label = g.display_name.split(',').slice(0, 2).join(',').trim()
    setPlace(label); setResults([]); setConfirmed(true); setError('')

    // tz-lookup carries a ~200kb timezone polygon table. It is only needed once a
    // city has actually been picked, so it is loaded then rather than on first paint.
    let tz: string | null = null
    try {
      const { default: tzlookup } = await import('tz-lookup')
      tz = tzlookup(lat, lon)
    } catch { /* ocean, unmapped, or chunk failure → keep the caller's zone */ }

    resolvedRef.current?.({ label, lat, lon, tz })
  }, [])

  /** Apply a known location (quick-pick preset, or a saved/profile chart). */
  const apply = useCallback((p: { label: string; lat: number; lon: number; tz: string }) => {
    setPlace(p.label); setResults([]); setConfirmed(true); setError('')
    resolvedRef.current?.({ label: p.label, lat: p.lat, lon: p.lon, tz: p.tz })
  }, [])

  /** Mark a place as already-known without firing onResolved (e.g. hydrating a draft). */
  const hydrate = useCallback((label: string) => {
    window.clearTimeout(timer.current)
    setPlace(label); setResults([]); setConfirmed(true); setError('')
  }, [])

  const reset = useCallback(() => {
    window.clearTimeout(timer.current)
    setPlace(''); setResults([]); setConfirmed(false); setError(''); setSearching(false)
  }, [])

  return { place, confirmed, results, searching, error, search, select, apply, hydrate, reset }
}
