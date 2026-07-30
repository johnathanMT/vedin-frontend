import { useEffect, useRef, useState, type RefObject } from 'react'

interface UseInViewOptions {
  threshold?: number
  rootMargin?: string
}

/**
 * useInView — returns [ref, inView]. Attach the ref to an element; `inView`
 * flips true/false as it enters/leaves the viewport. Used to PAUSE continuous
 * animations (timers, rAF, typing) while a section is off-screen → smoother
 * scrolling and far less battery/CPU drain on phones.
 */
export function useInView<T extends Element = HTMLElement>(
  { threshold = 0.1, rootMargin = '0px' }: UseInViewOptions = {},
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold, rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin])
  return [ref, inView]
}
