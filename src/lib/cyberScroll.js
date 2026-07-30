// ============================================================================
//  cyberScroll.js — the single bridge between GSAP scroll and the R3F render loop.
//
//  One scrubbed ScrollTrigger spans the whole page and writes a 0→1 progress
//  value into `scrollState`. The 3D camera reads that same value every frame, so
//  the WebGL flythrough and the HTML scroll are perfectly in sync — no second
//  scroll listener, no drift.
//
//  Requires:  npm i gsap
// ============================================================================
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Mutable, shared across modules. R3F's useFrame reads scrollState.progress.
export const scrollState = { progress: 0, velocity: 0 }

let trigger = null

/** Call once (e.g. in a top-level useEffect). Returns a cleanup fn. */
export function initCyberScroll() {
  if (trigger) return () => {}
  trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    scrub: true,
    onUpdate: (self) => {
      scrollState.progress = self.progress
      scrollState.velocity = self.getVelocity()
    },
  })
  return () => { trigger?.kill(); trigger = null }
}

export { gsap, ScrollTrigger }
