# Cyber Megacity Overhaul — Lead Architect Blueprint

Turning the portfolio into an Awwwards-tier, immersive R3F + GSAP experience —
**incrementally**, without breaking the live site. Starter files are already in
the repo (dormant until you install deps and wire them in).

---

## 0. Architecture at a glance

```
<App>  position:relative; z-index:10; background:transparent
 ├─ <CyberBackground/>   ← fixed full-screen WebGL, z-index:0  (the 3D world)
 │     └─ <Canvas>
 │           ├─ <NeonCity/>   instanced neon corridor + <Rig> (scroll-dolly camera)
 │           └─ <Effects/>    Bloom + ChromaticAberration + Noise + Glitch
 └─ <main> … your existing sections, now transparent, sitting ON TOP …
       └─ GSAP ScrollTrigger reveals (useCyberReveal)
```

The trick that makes it feel "one piece": **a single source of scroll truth.**
`src/lib/cyberScroll.js` runs one scrubbed `ScrollTrigger` that writes `0→1`
into `scrollState.progress`. The R3F camera reads that value every frame, and
your HTML reveals use the same GSAP instance — so WebGL and DOM never drift.

---

## 1. Install (one time)

```bash
npm i three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing gsap
# optional buttery smooth-scroll (Lusion/Samsy feel):
npm i lenis
```

You're on React 18, so this resolves to the R3F **v8** line (correct). If you
ever move to React 19, bump to R3F v9.

Files already created for you:

| File | Role |
|---|---|
| `src/three/CyberBackground.jsx` | Fixed `<Canvas>` + scene mount + scroll init |
| `src/three/NeonCity.jsx` | Instanced neon corridor + `<Rig>` scroll-dolly camera |
| `src/three/Effects.jsx` | Bloom / chromatic aberration / noise / glitch |
| `src/lib/cyberScroll.js` | The GSAP↔WebGL scroll bridge (`scrollState.progress`) |
| `src/hooks/useCyberReveal.js` | GSAP ScrollTrigger reveals for HTML sections |
| `index.css` | `.cyber-bg`, `.fullbleed`, `.display-hero/mega`, `.text-outline` |

---

## 2. Wire it in (App.jsx)

```jsx
import { lazy, Suspense } from 'react'
const CyberBackground = lazy(() => import('./three/CyberBackground')) // code-split the heavy bundle

export default function App() {
  // ...existing lang state...
  return (
    <>
      <Suspense fallback={null}><CyberBackground /></Suspense>
      <div className="relative z-10 min-h-screen text-white overflow-x-hidden bg-transparent">
        {/* AmbientBackground can stay or go — the 3D layer replaces most of it */}
        <Navbar lang={lang} setLang={setLang} />
        <main className="relative z-10">{/* …sections… */}</main>
        <Footer />
      </div>
    </>
  )
}
```

Key CSS contract: the content wrapper must be **transparent** and `z-index:10`,
the canvas is `z-index:0` (already set via `.cyber-bg`). Drop the opaque
`bg-[#07070f]` on the wrapper, or the 3D world won't show through. Give
individual sections semi-transparent backings (e.g. `bg-black/30 backdrop-blur`)
so text stays readable over the moving scene.

---

## 3. Scroll-linked camera (already in NeonCity `<Rig>`)

```jsx
useFrame((_, dt) => {
  const targetZ = 6 - scrollState.progress * (TRACK - 24)   // fly down the corridor
  camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3, dt) // smooth
  camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 1.6, 2.5, dt) // mouse parallax
  camera.lookAt(0, 1, camera.position.z - 10)
})
```

`damp` = frame-rate-independent smoothing → that premium, weighty glide.
Tune the feel with the `3` (higher = snappier) and the `TRACK` length.

**Alternative** (drei `ScrollControls`): if you'd rather virtualize scroll
inside the canvas and pin HTML pages to 3D, wrap the scene in
`<ScrollControls pages={6}>` and read `useScroll().offset`. The shared-state
approach above is better when you want your *existing* DOM scroll to stay normal.

---

## 4. Aggressive full-bleed typography (usable NOW, no deps)

Already added to `index.css`. Examples:

```jsx
{/* HERO — screen-spanning, hangs to the edges */}
<h1 className="fullbleed display-hero edge-left px-[4vw]">
  MYO THANT<br/>NAING
</h1>

{/* SECTION TITLE — mega, with a ghost outline layer behind for depth */}
<div className="fullbleed px-[4vw]">
  <h2 className="display-mega">PROJECTS</h2>
  <h2 className="display-mega text-outline -mt-[0.9em] translate-x-3 opacity-60" aria-hidden>PROJECTS</h2>
</div>
```

Principles top creative devs use:
- **Fluid scale**: `clamp(min, vw, max)` so type is huge but never overflows.
- **Sub-1 line-height** (`0.82`) and **negative tracking** (`-0.035em`) for the dense, brutalist block.
- **Full-bleed breakout** (`.fullbleed`) to escape centered max-width containers.
- **`text-wrap: balance`** for tidy multi-line headings.
- Pair giant type with **`mix-blend-mode: difference`** over the 3D scene for an electric, reactive look: `style={{ mixBlendMode: 'difference' }}`.

---

## 5. GSAP reveals synced to the world (already in `useCyberReveal`)

```jsx
import { useCyberReveal } from '../hooks/useCyberReveal'

export default function Section() {
  const scope = useCyberReveal()             // attach to the section
  return (
    <section ref={scope}>
      <h2 data-reveal data-parallax className="display-mega">ABOUT</h2>
      <div data-reveal className="glass-card">…</div>
    </section>
  )
}
```

`[data-reveal]` → rise + un-blur on enter. `[data-parallax]` → scrubbed drift
against the background. Because both use the same GSAP/ScrollTrigger as the
camera bridge, the card motion and the 3D dolly read as one continuous move.
For the *ultra*-smooth Lusion feel, add Lenis and tell ScrollTrigger to use it:

```js
import Lenis from 'lenis'
const lenis = new Lenis({ lerp: 0.1 })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0)
```

---

## 6. Post-processing (already in `Effects.jsx`)

`<Bloom>` is what sells the neon — it makes any bright/emissive material bleed
light. That's why `NeonCity` uses `meshBasicMaterial toneMapped={false}` with
saturated colours: they exceed Bloom's `luminanceThreshold` and glow. Add
`<ChromaticAberration>` (tiny offset) for the lens/signal feel, `<Noise>` for
film grain, and a **sporadic** `<Glitch>` so the tear is an accent, not a
seizure. Dial intensity via `Bloom intensity` + `luminanceThreshold`.

---

## 7. Performance & accessibility (non-negotiable for Awwwards)

- **Code-split** the canvas with `React.lazy` (done in the wiring above) so the
  ~600KB three bundle doesn't block first paint.
- **Clamp DPR** to `[1, 1.75]` (done) — full retina DPR on a fragment-heavy
  Bloom pass will melt laptops.
- **Mobile / reduced-motion fallback**: render a static CSS gradient + the
  starfield instead of the canvas when
  `matchMedia('(prefers-reduced-motion: reduce)')` matches or on small/low-power
  devices. Pattern:
  ```jsx
  const heavyOK = !reduceMotion && window.innerWidth > 820 && !navigator.connection?.saveData
  {heavyOK ? <CyberBackground/> : <div className="orbit-galaxy fixed inset-0 -z-0" />}
  ```
- **Pause when offscreen/hidden**: `document.hidden` → skip frames; or set
  `frameloop="demand"` and `invalidate()` on scroll if you don't need idle motion.
- Keep text contrast: put readable sections on `bg-black/40 backdrop-blur-md`.

---

## 8. Phased rollout (don't big-bang it)

1. **Now (no deps):** adopt the full-bleed type classes on Hero + section titles. Ship.
2. **Phase 2:** `npm i gsap`; replace IntersectionObserver reveals with `useCyberReveal`. Ship.
3. **Phase 3:** `npm i three @react-three/fiber @react-three/drei`; mount `<CyberBackground/>` behind a transparent App; tune the corridor. Ship behind the `heavyOK` guard.
4. **Phase 4:** `npm i @react-three/postprocessing postprocessing`; enable `<Effects/>`. Tune Bloom.
5. **Phase 5:** add Lenis, custom geometry/building textures, audio-reactive or section-aware camera waypoints.

Each phase is independently shippable and reversible — that's how you reach
Awwwards quality without a month of downtime.
