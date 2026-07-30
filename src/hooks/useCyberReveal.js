// ============================================================================
//  useCyberReveal — GSAP ScrollTrigger reveals for HTML, synced to page scroll.
//
//  Put the returned ref on a section, then mark children with [data-reveal].
//  They rise + un-blur as they enter the viewport, matching the 3D dolly feel.
//  gsap.context + ctx.revert() makes it React-StrictMode / unmount safe.
//
//  Requires:  npm i gsap
// ============================================================================
import { useRef } from 'react'

/**
 * useCyberReveal — DISABLED (no-op).
 *
 * Scroll-reveal / fade-in animations were removed site-wide: every section and
 * its [data-reveal] children must be fully visible and opaque by default. This
 * hook now just returns a ref so existing `ref={useCyberReveal()}` call sites keep
 * working without animating (and without leaving elements stuck at opacity:0,
 * which was also hiding the tech-stack logos in fresh browsers).
 */
export function useCyberReveal() {
  return useRef(null)
}
