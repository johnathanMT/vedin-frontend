import { useEffect, useRef } from 'react'

/**
 * CyberCursor — a crosshair ring that trails the pointer (lerped) with an
 * instant inner dot, and snaps/grows + turns magenta over interactive elements.
 * Fine-pointer devices only (skipped on touch); hides the native cursor while active.
 */
export default function CyberCursor() {
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia?.('(pointer: fine)')?.matches) return
    const r = ring.current, d = dot.current
    if (!r || !d) return

    document.documentElement.classList.add('has-cyber-cursor')

    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0
    const INTERACTIVE = 'a,button,[data-cursor],input,textarea,select,label,[role="button"]'

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      d.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
    }
    const onOver = (e: MouseEvent) => { if ((e.target as Element | null)?.closest(INTERACTIVE)) r.classList.add('is-active') }
    const onOut = (e: MouseEvent) => { if ((e.target as Element | null)?.closest(INTERACTIVE)) r.classList.remove('is-active') }

    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18
      r.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.documentElement.classList.remove('has-cyber-cursor')
    }
  }, [])

  return (
    <>
      <div ref={ring} className="cyber-cursor" aria-hidden="true" />
      <div ref={dot} className="cyber-cursor-dot" aria-hidden="true" />
    </>
  )
}
