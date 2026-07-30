import { useEffect, useRef, useState, type ReactNode } from 'react'

interface DeferUntilVisibleProps {
  children: ReactNode
  /** Shown in place of the content until it scrolls into range. */
  fallback?: ReactNode
  /** How far ahead of the viewport to start loading (IntersectionObserver rootMargin). */
  rootMargin?: string
  /** Reserve vertical space so the page doesn't jump when the real content mounts. */
  minHeight?: number | string
}

/**
 * DeferUntilVisible — renders `fallback` until its placeholder scrolls within
 * `rootMargin` of the viewport, then mounts `children` permanently (latched, so
 * it never unmounts / re-downloads on scroll-away).
 *
 * Pairs with React.lazy: a `lazy()` component rendered unconditionally fetches
 * its chunk on first render (i.e. immediately). Wrapping it here means the heavy
 * chunk — e.g. VisitorGlobe's ~1.4 MB three.js payload — isn't fetched until the
 * visitor is actually approaching the section, keeping the initial mobile load light.
 */
export default function DeferUntilVisible({
  children,
  fallback = null,
  rootMargin = '600px',
  minHeight,
}: DeferUntilVisibleProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    // No element or no IO support → render immediately (SSR/old browsers).
    if (!el || typeof IntersectionObserver === 'undefined') { setShow(true); return }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setShow(true); io.disconnect() }
    }, { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  if (show) return <>{children}</>
  return (
    <div ref={ref} aria-hidden style={minHeight ? { minHeight } : undefined}>
      {fallback}
    </div>
  )
}
