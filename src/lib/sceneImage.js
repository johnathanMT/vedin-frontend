// ============================================================================
//  sceneImage.js — lazy, cached fetch of a thematic "cinematic" still.
//
//  Provider: UNSPLASH (royalty-free, license-clean for public sites). Set
//  VITE_UNSPLASH_KEY to enable; without it, callers fall back to a themed
//  gradient (no broken UI). We deliberately do NOT pull copyrighted film stills.
//
//  Efficiency:
//   • single-flight per query (concurrent hovers share one request),
//   • in-memory + sessionStorage cache (re-hover = instant, survives nav),
//   • only called on demand (first hover), never on mount.
// ============================================================================
const KEY = import.meta.env.VITE_UNSPLASH_KEY
const mem = new Map()                 // query -> url | null | Promise

export async function getSceneImage(query) {
  if (!query) return null
  if (mem.has(query)) return mem.get(query)          // cached value or in-flight promise

  // sessionStorage (survives client-side navigation within the tab)
  try {
    const cached = sessionStorage.getItem('scene:' + query)
    if (cached !== null) { mem.set(query, cached || null); return cached || null }
  } catch { /* storage unavailable — ignore */ }

  if (!KEY) { mem.set(query, null); return null }    // no key → gradient fallback

  const inflight = (async () => {
    try {
      const url =
        `https://api.unsplash.com/search/photos?per_page=1&orientation=landscape` +
        `&content_filter=high&query=${encodeURIComponent(query)}&client_id=${KEY}`
      const res = await fetch(url)
      if (!res.ok) return null
      const data = await res.json()
      const img = data?.results?.[0]?.urls?.regular || null
      if (img) { try { sessionStorage.setItem('scene:' + query, img) } catch {} }
      return img
    } catch {
      return null
    }
  })()

  mem.set(query, inflight)            // dedupe concurrent callers
  const value = await inflight
  mem.set(query, value)               // replace promise with resolved value
  return value
}
