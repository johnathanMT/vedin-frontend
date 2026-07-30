import { useEffect, useState } from 'react'

/**
 * useIsMobile — lightweight, reactive, SSR-safe device-tier detection.
 *
 * "Mobile" = narrow viewport OR a coarse (touch) pointer with no fine pointer.
 * It re-evaluates on viewport changes so rotating a tablet updates the result.
 *
 * @param breakpoint  max width (px) considered "mobile". Default 820.
 */
export default function useIsMobile(breakpoint = 820): boolean {
  const query = `(max-width: ${breakpoint}px), (pointer: coarse) and (hover: none)`

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const onChange = (e: MediaQueryListEvent): void => setIsMobile(e.matches)
    setIsMobile(mql.matches)                 // sync in case it changed pre-effect
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [query])

  return isMobile
}
