import { m } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

// These use the lightweight `m` component and rely on the single <MotionProvider>
// mounted at the app root to supply the animation features. Do NOT import the
// full `motion` component anywhere — MotionProvider runs LazyMotion in `strict`
// mode and will throw, which is deliberate (it protects the bundle size).
const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const

interface RevealProps {
  children: ReactNode
  delay?: number
  /** Slide distance in px. 0 = fade only (use inside tight layouts). */
  y?: number
  className?: string
  style?: CSSProperties
}

/** Fade + rise a block into view once, the first time it is scrolled to.
 *  framer-motion zeroes out the transform automatically under
 *  prefers-reduced-motion, so this stays accessible. */
export function Reveal({ children, delay = 0, y = 12, className, style }: RevealProps) {
  return (
    <m.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </m.div>
  )
}

/** Same motion, driven by mount rather than scroll position — for content that
 *  appears in place (tab panels, results) where no scroll event ever fires. */
export function Appear({ children, delay = 0, y = 8, className, style }: RevealProps) {
  return (
    <m.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </m.div>
  )
}

export default Reveal
