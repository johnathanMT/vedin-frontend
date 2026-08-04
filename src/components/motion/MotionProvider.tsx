import { LazyMotion } from 'framer-motion'
import type { ReactNode } from 'react'

// Mounted ONCE at the app root. Everything below can then use the lightweight `m`
// components; the ~25kb animation feature set is fetched as its own chunk after
// first paint, so it never blocks the initial render.
//
// `strict` throws if any descendant imports the full `motion` component instead
// of `m` — that guard is what keeps the feature set from being pulled back into
// the main bundle by accident.
const loadFeatures = () => import('./features').then((mod) => mod.default)

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  )
}
